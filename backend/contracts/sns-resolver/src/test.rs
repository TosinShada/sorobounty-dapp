#![cfg(test)]

extern crate std;

use super::testutils::{register_test_contract as register_sns, SnsResolver};
use soroban_sdk::{testutils::Address as AddressTestTrait, Address, Bytes, BytesN, Env, String};

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

struct Setup {
    env: Env,
    admin_user: Address,
    base_node: BytesN<32>,
    domain_owner: Address,
    resolver: SnsResolver,
    registry_address: Address,
}

/// Sets up an sns with -
///
impl Setup {
    fn new() -> Self {
        let e: Env = soroban_sdk::Env::default();
        let admin_user = Address::random(&e);
        let domain_owner = Address::random(&e);
        let registry_address = Address::random(&e);
        let base_node = create_node(&e, "sns");

        let resolver_address = register_sns(&e);
        let resolver = SnsResolver::new(&e, resolver_address.clone());
        resolver.client().initialize(&admin_user);

        Self {
            env: e,
            admin_user,
            base_node,
            domain_owner,
            resolver,
            registry_address,
        }
    }
}

#[test]
fn test_set_registry() {
    let setup = Setup::new();
    let resolver = &setup.resolver;
    let registry_address = &setup.registry_address;
    let admin_user = &setup.admin_user;
    let base_node = &setup.base_node;

    resolver
        .client()
        .mock_all_auths()
        .set_registry(&admin_user, &base_node, &registry_address);

    let registry = resolver.client().registry(&base_node);
    assert_eq!(registry, *registry_address);
}

#[test]
fn test_set_name() {
    let setup = Setup::new();
    let resolver = &setup.resolver;
    let admin_user = &setup.admin_user;
    let base_node = &setup.base_node;
    let domain_owner = &setup.domain_owner;
    let label = create_node(&setup.env, "test");
    let domain = append_node(&setup.env, &base_node, &label);

    resolver
        .client()
        .mock_all_auths()
        .set_name(&admin_user, &domain, &domain_owner);

    let name = resolver.client().name(&domain);
    assert_eq!(name, *domain_owner);
}

#[test]
fn test_set_text() {
    let setup = Setup::new();
    let resolver = &setup.resolver;
    let admin_user = &setup.admin_user;
    let base_node = &setup.base_node;
    let text_record = String::from_slice(&setup.env, "wounvuwb3828240482jj");
    let label = create_node(&setup.env, "test");
    let domain = append_node(&setup.env, &base_node, &label);

    resolver
        .client()
        .mock_all_auths()
        .set_text(&admin_user, &domain, &text_record);

    let text = resolver.client().text(&domain);
    assert_eq!(text.len(), 1);
    assert_eq!(text.get_unchecked(0), text_record);
}

#[test]
#[should_panic(expected = "No name found")]
fn test_remove() {
    let setup = Setup::new();
    let resolver = &setup.resolver;
    let admin_user = &setup.admin_user;
    let base_node = &setup.base_node;
    let text_record = String::from_slice(&setup.env, "wounvuwb3828240482jj");
    let domain_owner = &setup.domain_owner;
    let label = create_node(&setup.env, "test");
    let domain = append_node(&setup.env, &base_node, &label);

    resolver
        .client()
        .mock_all_auths()
        .set_name(&admin_user, &domain, &domain_owner);

    resolver
        .client()
        .mock_all_auths()
        .set_text(&admin_user, &domain, &text_record);

    let name = resolver.client().name(&domain);
    let text = resolver.client().text(&domain);

    assert_eq!(name, *domain_owner);
    assert_eq!(text.len(), 1);
    assert_eq!(text.get_unchecked(0), text_record);

    resolver
        .client()
        .mock_all_auths()
        .remove(&admin_user, &domain);

    let _address = resolver.client().name(&domain);
}
