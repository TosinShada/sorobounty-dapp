#![no_std]
use core::panic;

use soroban_sdk::{contract, contractimpl, contracttype, log, Address, Bytes, BytesN, Env};

mod events;
mod test;
mod testutils;

pub(crate) const BUMP_AMOUNT: u32 = 518400; // 30 days

#[derive(Clone, Debug)]
#[contracttype]
pub struct Record {
    pub owner: Address,
    pub resolver: Address,
    pub ttl: u32,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    // Bytes of the name => Record
    Records(BytesN<32>),
    // [Operator Address, Owner Address] => bool
    Operators(Address, Address),
    // Address => Admin
    Admin,
}

/*
Getter Functions
*/
fn get_administrator(e: &Env) -> Address {
    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Admin)
        .unwrap()
}

fn has_administrator(e: &Env) -> bool {
    e.storage().persistent().has(&DataKey::Admin)
}

fn has_record(e: &Env, node: &BytesN<32>) -> bool {
    e.storage().persistent().has(&DataKey::Records(node.clone()))
}

fn get_record_by_node(e: &Env, node: &BytesN<32>) -> Record {
    let default_record = Record {
        owner: get_administrator(&e),
        resolver: e.current_contract_address(),
        ttl: 0,
    };

    e.storage()
        .persistent()
        .get::<_, Record>(&DataKey::Records(node.clone()))
        .unwrap_or(default_record)
}

fn get_owner(e: &Env, node: &BytesN<32>) -> Address {
    get_record_by_node(e, node).owner
}

fn get_resolver(e: &Env, node: &BytesN<32>) -> Address {
    get_record_by_node(e, node).resolver
}

fn get_ttl(e: &Env, node: &BytesN<32>) -> u32 {
    get_record_by_node(e, node).ttl
}

fn is_operator_approved(e: &Env, operator: &Address, owner: &Address) -> bool {
    e.storage()
        .persistent()
        .get::<_, bool>(&DataKey::Operators(operator.clone(), owner.clone()))
        .unwrap_or(false)
}

/*
Modifiers for the contract
*/
fn require_node_authorised(e: &Env, node: &BytesN<32>, caller: &Address) {
    let record = get_record_by_node(e, node);
    assert!(
        record.owner == *caller || is_operator_approved(e, &record.owner, caller),
        "caller is not authorised"
    );
}

/*
State Changing Functions
*/
fn set_administrator(e: &Env, caller: &Address) {
    e.storage().persistent().set(&DataKey::Admin, caller);
    e.storage().persistent().bump(&DataKey::Admin, BUMP_AMOUNT);
}

fn set_owner(e: &Env, node: &BytesN<32>, owner: &Address) {
    let mut record = get_record_by_node(e, node);
    record.owner = owner.clone();
    e.storage()
        .persistent()
        .set(&DataKey::Records(node.clone()), &record);
    e.storage()
        .persistent()
        .bump(&DataKey::Records(node.clone()), BUMP_AMOUNT);
}

fn set_resolver_ttl(e: &Env, node: &BytesN<32>, resolver: &Address, ttl: &u32) {
    let mut record = get_record_by_node(e, node);
    record.resolver = resolver.clone();
    record.ttl = ttl.clone();
    e.storage()
        .persistent()
        .set(&DataKey::Records(node.clone()), &record);
    e.storage()
        .persistent()
        .bump(&DataKey::Records(node.clone()), BUMP_AMOUNT);
}

fn set_resolver(e: &Env, node: &BytesN<32>, resolver: &Address) {
    let mut record = get_record_by_node(e, node);
    record.resolver = resolver.clone();
    e.storage()
        .persistent()
        .set(&DataKey::Records(node.clone()), &record);
    e.storage()
        .persistent()
        .bump(&DataKey::Records(node.clone()), BUMP_AMOUNT);
}

fn set_ttl(e: &Env, node: &BytesN<32>, ttl: &u32) {
    let mut record = get_record_by_node(e, node);
    record.ttl = ttl.clone();
    e.storage()
        .persistent()
        .set(&DataKey::Records(node.clone()), &record);
    e.storage()
        .persistent()
        .bump(&DataKey::Records(node.clone()), BUMP_AMOUNT);
}

fn set_parent_node_owner(e: &Env, node: &BytesN<32>, owner: &Address) {
    set_owner(e, node, owner);
    events::new_owner(e, owner.clone(), node.clone());
}

fn set_subnode_owner(e: &Env, node: &BytesN<32>, label: &BytesN<32>, owner: &Address) {
    if !has_record(e, node) {
        panic!("node does not exist");
    }
    let subnode = append_hash(e, node, label);
    set_owner(e, &subnode, owner);
    events::transfer_owner(&e, node.clone(), label.clone(), owner.clone());
}

fn set_approval_for_all(e: &Env, operator: &Address, caller: &Address, approved: &bool) {
    e.storage().persistent().set(
        &DataKey::Operators(operator.clone(), caller.clone()),
        approved,
    );
    e.storage().persistent().bump(
        &DataKey::Operators(operator.clone(), caller.clone()),
        BUMP_AMOUNT,
    );

    events::set_approval_for_all(&e, operator.clone(), caller.clone(), approved.clone());
}

fn append_hash(env: &Env, parent_hash: &BytesN<32>, leaf_hash: &BytesN<32>) -> BytesN<32> {
    let mut bytes = Bytes::new(env);
    bytes.append(&leaf_hash.clone().into());
    bytes.append(&parent_hash.clone().into());
    env.crypto().sha256(&bytes)
}

#[contract]
struct SnsRegistry;

#[contractimpl]
#[allow(clippy::needless_pass_by_value)]
impl SnsRegistry {
    pub fn initialize(e: Env, admin: Address) {
        if has_administrator(&e) {
            panic!("already initialized")
        }
        set_administrator(&e, &admin);
    }

    pub fn set_record(
        e: Env,
        caller: Address,
        node: BytesN<32>,
        owner: Address,
        resolver: Address,
        ttl: u32,
    ) {
        caller.require_auth();
        require_node_authorised(&e, &node, &caller);
        set_parent_node_owner(&e, &node, &owner);
        log!(&e, "entered here");
        set_resolver_ttl(&e, &node, &resolver, &ttl);
    }

    pub fn set_subnode_record(
        e: Env,
        caller: Address,
        node: BytesN<32>,
        owner: Address,
        label: BytesN<32>,
        resolver: Address,
        ttl: u32,
    ) {
        caller.require_auth();
        require_node_authorised(&e, &node, &caller);
        set_subnode_owner(&e, &node, &label, &owner);
        let subnode = append_hash(&e, &node, &label);
        set_resolver_ttl(&e, &subnode, &resolver, &ttl);
    }

    // Sets the owner of a tld (top level domain eg. .sns)
    // It checks if the caller is the owner of the node for already existing tld's or the admin for new tld's

    pub fn set_owner(e: Env, caller: Address, node: BytesN<32>, owner: Address) {
        caller.require_auth();
        require_node_authorised(&e, &node, &caller);
        set_parent_node_owner(&e, &node, &owner);
    }

    pub fn set_subnode_owner(
        e: Env,
        caller: Address,
        node: BytesN<32>,
        label: BytesN<32>,
        owner: Address,
    ) {
        caller.require_auth();
        require_node_authorised(&e, &node, &caller);
        set_subnode_owner(&e, &node, &label, &owner);
    }

    pub fn set_resolver(e: Env, caller: Address, node: BytesN<32>, resolver: Address) {
        caller.require_auth();
        require_node_authorised(&e, &node, &caller);
        set_resolver(&e, &node, &resolver);
    }

    pub fn set_ttl(e: Env, caller: Address, node: BytesN<32>, ttl: u32) {
        caller.require_auth();
        require_node_authorised(&e, &node, &caller);
        set_ttl(&e, &node, &ttl);
    }

    pub fn set_approval_for_all(e: Env, caller: Address, operator: Address, approved: bool) {
        caller.require_auth();
        set_approval_for_all(&e, &operator, &caller, &approved);
        log!(&e, "entered here");
    }

    pub fn owner(e: Env, node: BytesN<32>) -> Address {
        get_owner(&e, &node)
    }

    pub fn resolver(e: Env, node: BytesN<32>) -> Address {
        get_resolver(&e, &node)
    }

    pub fn ttl(e: Env, node: BytesN<32>) -> u32 {
        get_ttl(&e, &node)
    }

    pub fn record(e: Env, node: BytesN<32>) -> Record {
        get_record_by_node(&e, &node)
    }

    pub fn record_exist(e: Env, node: BytesN<32>) -> bool {
        let record = get_record_by_node(&e, &node);
        let admin = get_administrator(&e);
        record.owner != admin
    }

    pub fn is_approved_for_all(e: Env, operator: Address, owner: Address) -> bool {
        is_operator_approved(&e, &operator, &owner)
    }
}
