#![no_std]
use core::panic;

use soroban_sdk::{contract, contractimpl, contracttype, log, Address, BytesN, Env};

mod registry_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/sns_registry.wasm"
    );
}
mod events;
mod test;
mod testutils;

pub(crate) const BUMP_AMOUNT: u32 = 518400; // 30 days
pub(crate) const GRACE_PERIOD: u64 = 1555200; // 90 days

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    // Registry Contract Address
    // () => Address
    Registry,
    // The hash of the tld (eg. .sns) owned by this contract
    // () => BytesN<32>
    BaseNode,
    // Addresses that can call privileged functions
    // (Address) => bool
    Controllers(Address),
    // Owner of the domain
    // BytesN<32> => Address
    Owners(BytesN<32>),
    // Expirations of the domains
    // pass the hash of the domain and get the expiration time as a timestamp
    // BytesN<32> => u64
    Expirations(BytesN<32>),
    // Admin of this contract
    // () => Address
    Admin,
}

/*
Getter Functions
*/
fn get_ledger_timestamp(e: &Env) -> u64 {
    e.ledger().timestamp()
}

fn get_administrator(e: &Env) -> Address {
    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Admin)
        .unwrap()
}

fn get_controller_status(e: &Env, caller: &Address) -> bool {
    e.storage()
        .persistent()
        .get::<_, bool>(&DataKey::Controllers(caller.clone()))
        .unwrap_or(false)
}

fn get_domain_owner(e: &Env, node: &BytesN<32>) -> Address {
    let expiry_time = get_domain_expiry(e, node);

    if get_ledger_timestamp(e) > (expiry_time + GRACE_PERIOD) {
        return e.current_contract_address();
    }

    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Owners(node.clone()))
        .unwrap_or(e.current_contract_address())
}

fn get_domain_expiry(e: &Env, node: &BytesN<32>) -> u64 {
    e.storage()
        .persistent()
        .get::<_, u64>(&DataKey::Expirations(node.clone()))
        .unwrap_or(0)
}

fn get_registry_owner(e: &Env) -> Address {
    let base_node = get_base_node(e);
    let registry = get_registry(e);

    let registry_client = registry_contract::Client::new(&e, &registry);
    registry_client.owner(&base_node)
}

fn get_base_node(e: &Env) -> BytesN<32> {
    e.storage()
        .persistent()
        .get::<_, BytesN<32>>(&DataKey::BaseNode)
        .unwrap()
}

fn get_registry(e: &Env) -> Address {
    e.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Registry)
        .unwrap()
}

fn has_registry(e: &Env) -> bool {
    e.storage().persistent().has(&DataKey::Registry)
}

fn is_name_available(e: &Env, name: &BytesN<32>) -> bool {
    let domain_owner = get_domain_owner(&e, &name);
    domain_owner == e.current_contract_address()
}

/*
Modifiers for the contract
*/
fn require_owner(e: &Env, node: &BytesN<32>, caller: &Address) {
    let domain_owner = get_domain_owner(e, node);
    assert!(domain_owner == *caller, "caller is not authorised");
}

fn require_registry_ownership(e: &Env) {
    let registrar = get_registry_owner(e);
    assert!(
        registrar == e.current_contract_address(),
        "Registrar is not authorised"
    );
}

fn require_active_controller(e: &Env, caller: &Address) {
    let controller_status = get_controller_status(e, caller);
    assert!(controller_status, "caller is not authorised");
}

fn require_administrator(e: &Env, caller: &Address) {
    let admin = get_administrator(e);
    assert!(admin == *caller, "caller is not authorised");
}

/*
State Changing Functions
*/
fn set_controller(e: &Env, caller: &Address, status: &bool) {
    e.storage()
        .persistent()
        .set(&DataKey::Controllers(caller.clone()), status);
    e.storage()
        .persistent()
        .bump(&DataKey::Controllers(caller.clone()), BUMP_AMOUNT);
}

fn remove_controller(e: &Env, caller: &Address) {
    e.storage()
        .persistent()
        .remove(&DataKey::Controllers(caller.clone()));
}

fn set_domain_owner(e: &Env, node: &BytesN<32>, owner: &Address) {
    e.storage()
        .persistent()
        .set(&DataKey::Owners(node.clone()), owner);
    e.storage()
        .persistent()
        .bump(&DataKey::Owners(node.clone()), BUMP_AMOUNT);
}

fn set_domain_expiry(e: &Env, node: &BytesN<32>, expiry: &u64) {
    e.storage()
        .persistent()
        .set(&DataKey::Expirations(node.clone()), expiry);
    e.storage()
        .persistent()
        .bump(&DataKey::Expirations(node.clone()), BUMP_AMOUNT);
}

fn set_registry(e: &Env, registry: &Address) {
    e.storage().persistent().set(&DataKey::Registry, registry);
    e.storage()
        .persistent()
        .bump(&DataKey::Registry, BUMP_AMOUNT);
}

fn set_base_node(e: &Env, base_node: &BytesN<32>) {
    e.storage().persistent().set(&DataKey::BaseNode, base_node);
    e.storage()
        .persistent()
        .bump(&DataKey::BaseNode, BUMP_AMOUNT);
}

fn set_administrator(e: &Env, caller: &Address) {
    e.storage().persistent().set(&DataKey::Admin, caller);
    e.storage().persistent().bump(&DataKey::Admin, BUMP_AMOUNT);
}

#[contract]
struct SnsRegistrar;

#[contractimpl]
#[allow(clippy::needless_pass_by_value)]
impl SnsRegistrar {
    pub fn initialize(e: Env, registry: Address, admin: Address, base_node: BytesN<32>) {
        if has_registry(&e) {
            panic!("already initialized")
        }
        set_registry(&e, &registry);
        set_base_node(&e, &base_node);
        set_administrator(&e, &admin);
    }

    pub fn add_controller(e: Env, caller: Address, controller: Address) {
        caller.require_auth();
        require_registry_ownership(&e);
        require_administrator(&e, &caller);
        set_controller(&e, &controller, &true);
    }

    pub fn remove_controller(e: Env, caller: Address, controller: Address) {
        caller.require_auth();
        require_registry_ownership(&e);
        require_administrator(&e, &caller);
        remove_controller(&e, &controller);
    }

    pub fn transfer_contract_ownership(e: Env, caller: Address, new_owner: Address) {
        caller.require_auth();
        require_registry_ownership(&e);
        require_administrator(&e, &caller);
        set_administrator(&e, &new_owner);
    }

    pub fn set_resolver(e: Env, caller: Address, resolver: Address) {
        caller.require_auth();
        require_administrator(&e, &caller);
        let base_node = get_base_node(&e);
        let registry = get_registry(&e);
        let registry_client = registry_contract::Client::new(&e, &registry);
        registry_client.set_resolver(&e.current_contract_address(), &base_node, &resolver);
    }

    pub fn set_record(e: Env, caller: Address, owner: Address, resolver: Address, ttl: u32) {
        caller.require_auth();
        require_administrator(&e, &caller);
        let base_node = get_base_node(&e);
        let registry = get_registry(&e);
        let registry_client = registry_contract::Client::new(&e, &registry);
        registry_client.set_record(
            &e.current_contract_address(),
            &base_node,
            &owner,
            &resolver,
            &ttl,
        );
    }

    pub fn name_expiry(e: Env, name: BytesN<32>) -> u64 {
        get_domain_expiry(&e, &name)
    }

    pub fn name_owner(e: Env, name: BytesN<32>) -> Address {
        get_domain_owner(&e, &name)
    }

    pub fn available(e: Env, name: BytesN<32>) -> bool {
        is_name_available(&e, &name)
    }

    pub fn is_controller(e: Env, caller: Address) -> bool {
        get_controller_status(&e, &caller)
    }

    pub fn register(
        e: Env,
        caller: Address,
        owner: Address,
        name: BytesN<32>,
        duration: u64,
    ) -> u64 {
        caller.require_auth();
        // Comment out to allow anyone to register a name
        // require_active_controller(&e, &caller);
        require_registry_ownership(&e);
        assert!(is_name_available(&e, &name), "name is not available");

        // [todo] test this to see how it works
        let expiry_date = get_ledger_timestamp(&e) + duration;
        if expiry_date + GRACE_PERIOD > u64::MAX {
            panic!("duration is too long");
        }

        set_domain_owner(&e, &name, &owner);
        set_domain_expiry(&e, &name, &expiry_date);

        let base_node = get_base_node(&e);
        let registry = get_registry(&e);
        let registry_client = registry_contract::Client::new(&e, &registry);
        registry_client.set_subnode_owner(&e.current_contract_address(), &base_node, &name, &owner);

        expiry_date
    }

    pub fn renew(e: Env, caller: Address, name: BytesN<32>, duration: u64) -> u64 {
        caller.require_auth();
        require_active_controller(&e, &caller);
        require_registry_ownership(&e);
        assert!(!is_name_available(&e, &name), "name is not registered");

        let expiry_date = get_domain_expiry(&e, &name);
        // Check if the domain is expired or not registered by getting the expiry date which can either be a timestamp or 0
        // If the expiry date is 0 then the domain is not registered and therefore adding the grace period will certainly make it less than the current timestamp
        if expiry_date + GRACE_PERIOD < get_ledger_timestamp(&e) {
            panic!("domain is expired or not registered");
        }

        let new_expiry_date = expiry_date + duration;
        if new_expiry_date + GRACE_PERIOD > u64::MAX {
            panic!("duration is too long");
        }

        set_domain_expiry(&e, &name, &new_expiry_date);

        new_expiry_date
    }
}
