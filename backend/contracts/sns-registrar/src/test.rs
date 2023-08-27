#![cfg(test)]

extern crate std;

use std::println;

use super::testutils::{register_registry, register_test_contract as register_sns, SnsRegistrar};
use sns_registry_interface::SnsRegistryClient;
use soroban_sdk::{
    testutils::{Address as AddressTestTrait, Ledger},
    Address, Bytes, BytesN, Env,
};

fn create_registry_contract<'a>(e: &Env, admin: &Address) -> (Address, SnsRegistryClient<'a>) {
    let registry_id = register_registry(e);

    let registry: SnsRegistryClient<'_> = SnsRegistryClient::new(&e, &registry_id);
    registry.initialize(admin);
    (registry_id, registry)
}

fn advance_ledger(e: &Env, delta: u64) {
    e.ledger().with_mut(|l| {
        l.timestamp += delta;
    });
}

fn create_node(e: &Env, name: &str) -> BytesN<32> {
    let node = Bytes::from_slice(&e, name.as_bytes());
    e.crypto().sha256(&node)
}

fn append_node(e: &Env, node: &BytesN<32>, label: &BytesN<32>) -> BytesN<32> {
    let mut bytes = Bytes::new(e);
    bytes.append(&label.clone().into());
    bytes.append(&node.clone().into());
    e.crypto().sha256(&bytes)
}

struct Setup<'a> {
    env: Env,
    admin_user: Address,
    backup_admin_user: Address,
    controller: Address,
    base_node: BytesN<32>,
    domain_owner: Address,
    resolver: Address,
    registrar: SnsRegistrar,
    registrar_address: Address,
    registry: SnsRegistryClient<'a>,
}

/// Sets up an sns with -
///
impl Setup<'_> {
    fn new() -> Self {
        let e: Env = soroban_sdk::Env::default();
        let admin_user = Address::random(&e);
        let backup_admin_user = Address::random(&e);
        let controller = Address::random(&e);
        let domain_owner = Address::random(&e);
        let resolver = Address::random(&e);
        let base_node = create_node(&e, "sns");

        let registrar_address = register_sns(&e);
        let (registry_address, registry) = create_registry_contract(&e, &registrar_address);

        let registrar = SnsRegistrar::new(&e, registrar_address.clone());
        registrar
            .client()
            .initialize(&registry_address, &admin_user, &base_node);

        Self {
            env: e,
            admin_user,
            backup_admin_user,
            controller,
            base_node,
            domain_owner,
            resolver,
            registrar,
            registrar_address,
            registry,
        }
    }
}

#[test]
fn test_add_controller() {
    let setup = Setup::new();
    setup
        .registrar
        .client()
        .mock_all_auths()
        .add_controller(&setup.admin_user, &setup.controller);

    assert_eq!(
        true,
        setup.registrar.client().is_controller(&setup.controller)
    );
}

#[test]
fn test_remove_controller() {
    let setup = Setup::new();
    setup
        .registrar
        .client()
        .mock_all_auths()
        .add_controller(&setup.admin_user, &setup.controller);

    assert_eq!(
        true,
        setup.registrar.client().is_controller(&setup.controller)
    );

    setup
        .registrar
        .client()
        .mock_all_auths()
        .remove_controller(&setup.admin_user, &setup.controller);

    assert_eq!(
        false,
        setup.registrar.client().is_controller(&setup.controller)
    );
}

#[test]
fn test_transfer_contract_ownership() {
    let setup = Setup::new();
    
    setup
        .registrar
        .client()
        .mock_all_auths()
        .transfer_contract_ownership(&setup.admin_user, &setup.backup_admin_user);

    setup
        .registrar
        .client()
        .mock_all_auths()
        .add_controller(&setup.backup_admin_user, &setup.controller);

    assert_eq!(
        true,
        setup.registrar.client().is_controller(&setup.controller)
    );
}

#[test]
fn test_set_resolver() {
    let setup = Setup::new();
    setup
        .registrar
        .client()
        .mock_all_auths()
        .set_resolver(&setup.admin_user, &setup.resolver);

    assert_eq!(setup.resolver, setup.registry.resolver(&setup.base_node));
}

#[test]
fn test_register() {
    let setup = Setup::new();

    setup
        .registrar
        .client()
        .mock_all_auths()
        .add_controller(&setup.admin_user, &setup.controller);

    let label = create_node(&setup.env, "test");
    let sub_node = append_node(&setup.env, &setup.base_node, &label);

    setup
        .registrar
        .client()
        .mock_all_auths()
        .set_record(&setup.admin_user, &setup.registrar_address, &setup.resolver, &6220800);

    setup
        .registrar
        .client()
        .mock_all_auths()
        .register(&setup.controller, &setup.domain_owner, &label, &6220800);

    assert_eq!(setup.domain_owner, setup.registry.owner(&sub_node));
    assert_eq!(6220800, setup.registrar.client().name_expiry(&label));
    assert_eq!(setup.domain_owner, setup.registrar.client().name_owner(&label));
}

#[test]
fn test_expiry() {
    let setup = Setup::new();

    setup
        .registrar
        .client()
        .mock_all_auths()
        .add_controller(&setup.admin_user, &setup.controller);

    let label = create_node(&setup.env, "test");

    setup
        .registrar
        .client()
        .mock_all_auths()
        .set_record(&setup.admin_user, &setup.registrar_address, &setup.resolver, &6220800);

    setup
        .registrar
        .client()
        .mock_all_auths()
        .register(&setup.controller, &setup.domain_owner, &label, &6220800);

    assert_eq!(6220800, setup.registrar.client().name_expiry(&label));
    assert_eq!(setup.domain_owner, setup.registrar.client().name_owner(&label));

    advance_ledger(&setup.env, 6220800);

    // It shouldn't be available because of the grace period
    assert_eq!(false, setup.registrar.client().available(&label));

    advance_ledger(&setup.env, 1555201);
    assert_eq!(true, setup.registrar.client().available(&label));
}

#[test]
fn test_renew() {
    let setup = Setup::new();

    setup
        .registrar
        .client()
        .mock_all_auths()
        .add_controller(&setup.admin_user, &setup.controller);

    let label = create_node(&setup.env, "test");

    setup
        .registrar
        .client()
        .mock_all_auths()
        .set_record(&setup.admin_user, &setup.registrar_address, &setup.resolver, &6220800);

    setup
        .registrar
        .client()
        .mock_all_auths()
        .register(&setup.controller, &setup.domain_owner, &label, &6220800);

    assert_eq!(6220800, setup.registrar.client().name_expiry(&label));
    assert_eq!(setup.domain_owner, setup.registrar.client().name_owner(&label));

    advance_ledger(&setup.env, 6220800);

    // It shouldn't be available because of the grace period
    assert_eq!(false, setup.registrar.client().available(&label));

    setup
        .registrar
        .client()
        .mock_all_auths()
        .renew(&setup.controller, &label, &6220800);

    assert_eq!(12441600, setup.registrar.client().name_expiry(&label));
    assert_eq!(setup.domain_owner, setup.registrar.client().name_owner(&label));
}