#![cfg(test)]

extern crate std;

use super::testutils::{register_test_contract as register_sns, SnsRegistry};
use soroban_sdk::{
    testutils::{Address as AddressTestTrait, Ledger},
    Address, Bytes, BytesN, Env,
};

fn create_sns_contract(e: &Env, admin: &Address) -> SnsRegistry {
    let id = register_sns(e);
    let sns = SnsRegistry::new(e, id.clone());
    sns.client().initialize(admin);
    sns
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

struct Setup {
    env: Env,
    admin_user: Address,
    node_owner: Address,
    subnode_owner: Address,
    resolver: Address,
    sns: SnsRegistry,
}

/// Sets up an sns with -
///
impl Setup {
    fn new() -> Self {
        let e: Env = soroban_sdk::Env::default();
        let admin_user = Address::random(&e);
        let node_owner = Address::random(&e);
        let subnode_owner = Address::random(&e);
        let resolver = Address::random(&e);

        // Create the sns contract
        let sns = create_sns_contract(&e, &admin_user);

        Self {
            env: e,
            admin_user,
            node_owner,
            subnode_owner,
            resolver,
            sns,
        }
    }
}

#[test]
fn test_set_record() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 6);

    let node = create_node(&setup.env, "sns");

    setup.sns.client().mock_all_auths().set_record(
        &setup.admin_user,
        &node,
        &setup.node_owner,
        &setup.resolver,
        &10,
    );

    let sns_record = setup.sns.client().record(&node);

    assert_eq!(sns_record.owner, setup.node_owner);
    assert_eq!(sns_record.resolver, setup.resolver);
    assert_eq!(sns_record.ttl, 10);
}

#[test]
fn test_set_subnode_record() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 6);

    let node = create_node(&setup.env, "sns");
    let label = create_node(&setup.env, "tosin");
    let subnode = append_node(&setup.env, &node, &label);

    setup.sns.client().mock_all_auths().set_record(
        &setup.admin_user,
        &node,
        &setup.node_owner,
        &setup.resolver,
        &10,
    );

    setup.sns.client().mock_all_auths().set_subnode_record(
        &setup.node_owner,
        &node,
        &setup.subnode_owner,
        &label,
        &setup.resolver,
        &10,
    );

    let sns_record = setup.sns.client().record(&subnode);

    assert_eq!(sns_record.owner, setup.subnode_owner);
    assert_eq!(sns_record.resolver, setup.resolver);
    assert_eq!(sns_record.ttl, 10);
}

#[test]
fn test_set_subnode_owner() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 6);

    let node = create_node(&setup.env, "sns");
    let label = create_node(&setup.env, "tosin");
    let subnode = append_node(&setup.env, &node, &label);

    setup.sns.client().mock_all_auths().set_record(
        &setup.admin_user,
        &node,
        &setup.node_owner,
        &setup.resolver,
        &10,
    );

    setup.sns.client().mock_all_auths().set_subnode_owner(
        &setup.node_owner,
        &node,
        &label,
        &setup.node_owner,
    );

    let sns_record = setup.sns.client().record(&subnode);

    assert_eq!(sns_record.owner, setup.node_owner);
}

#[test]
fn test_set_resolver() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 6);

    let node = create_node(&setup.env, "sns");
    let new_resolver = Address::random(&setup.env);

    setup.sns.client().mock_all_auths().set_record(
        &setup.admin_user,
        &node,
        &setup.node_owner,
        &setup.resolver,
        &10,
    );

    let old_resolver = setup.sns.client().resolver(&node);

    assert_eq!(old_resolver, setup.resolver);

    setup
        .sns
        .client()
        .mock_all_auths()
        .set_resolver(&setup.node_owner, &node, &new_resolver);

    assert_eq!(new_resolver, setup.sns.client().resolver(&node));
}

#[test]
fn test_set_owner() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 6);

    let node = create_node(&setup.env, "sns");
    let new_owner = Address::random(&setup.env);

    setup.sns.client().mock_all_auths().set_record(
        &setup.admin_user,
        &node,
        &setup.node_owner,
        &setup.resolver,
        &10,
    );

    let old_owner = setup.sns.client().owner(&node);

    assert_eq!(old_owner, setup.node_owner);

    setup
        .sns
        .client()
        .mock_all_auths()
        .set_owner(&setup.node_owner, &node, &new_owner);

    assert_eq!(new_owner, setup.sns.client().owner(&node));
}

#[test]
fn test_set_ttl() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 6);

    let node = create_node(&setup.env, "sns");
    let new_ttl = 40;

    setup.sns.client().mock_all_auths().set_record(
        &setup.admin_user,
        &node,
        &setup.node_owner,
        &setup.resolver,
        &10,
    );

    let old_ttl = setup.sns.client().ttl(&node);

    assert_eq!(old_ttl, 10);

    setup
        .sns
        .client()
        .mock_all_auths()
        .set_ttl(&setup.node_owner, &node, &new_ttl);

    assert_eq!(new_ttl, setup.sns.client().ttl(&node));
}

#[test]
fn test_set_approval_for_all() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 6);

    let operator = Address::random(&setup.env);
    let approved = true;

    setup
        .sns
        .client()
        .mock_all_auths()
        .set_approval_for_all(&setup.node_owner, &operator, &approved);

    assert_eq!(
        approved,
        setup.sns.client().is_approved_for_all(&operator, &setup.node_owner)
    );
}

#[test]
fn test_record_exist() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 6);

    let node = create_node(&setup.env, "sns");

    setup.sns.client().mock_all_auths().set_record(
        &setup.admin_user,
        &node,
        &setup.node_owner,
        &setup.resolver,
        &10,
    );

    assert_eq!(true, setup.sns.client().record_exist(&node));
}

