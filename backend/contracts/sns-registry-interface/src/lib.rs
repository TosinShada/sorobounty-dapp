#![deny(warnings)]
#![no_std]

use soroban_sdk::{contractclient, contractspecfn, contracttype, Address, BytesN, Env};
pub struct Spec;


#[derive(Clone, Debug)]
#[contracttype]
pub struct Record {
    pub owner: Address,
    pub resolver: Address,
    pub ttl: u32,
}

/// Interface for SnsRegistry
#[contractspecfn(name = "Spec", export = false)]
#[contractclient(name = "SnsRegistryClient")]
pub trait SnsRegistryTrait {
    fn initialize(e: Env, admin: Address);
    fn set_record(
        e: Env,
        caller: Address,
        node: BytesN<32>,
        owner: Address,
        resolver: Address,
        ttl: u32,
    );
    fn set_owner(e: Env, caller: Address, node: BytesN<32>, owner: Address);
    fn set_subnode_owner(
        e: Env,
        caller: Address,
        node: BytesN<32>,
        label: BytesN<32>,
        owner: Address,
    );
    fn set_resolver(e: Env, caller: Address, node: BytesN<32>, resolver: Address);
    fn set_ttl(e: Env, caller: Address, node: BytesN<32>, ttl: u32);
    fn set_approval_for_all(e: Env, caller: Address, operator: Address, approved: bool);
    fn owner(e: Env, node: BytesN<32>) -> Address;
    fn resolver(e: Env, node: BytesN<32>) -> Address;
    fn ttl(e: Env, node: BytesN<32>) -> u32;
    fn record(e: Env, node: BytesN<32>) -> Record;
    fn record_exist(e: Env, node: BytesN<32>) -> bool;
    fn is_approved_for_all(e: Env, operator: Address, owner: Address) -> bool;
}
