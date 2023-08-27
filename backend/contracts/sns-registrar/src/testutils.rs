#![cfg(test)]

use crate::SnsRegistrarClient;
use soroban_sdk::{Address, Env};

mod registry_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/sns_registry.wasm"
    );
}

pub fn register_test_contract(e: &Env) -> Address {
    e.register_contract(None, crate::SnsRegistrar {})
}

pub fn register_registry(e: &Env) -> Address {
    e.register_contract_wasm(None, registry_contract::WASM)
}

pub struct SnsRegistrar {
    env: Env,
    contract_id: Address,
}

impl SnsRegistrar {
    #[must_use]
    pub fn client(&self) -> SnsRegistrarClient {
        SnsRegistrarClient::new(&self.env, &self.contract_id)
    }

    #[must_use]
    pub fn new(env: &Env, contract_id: Address) -> Self {
        Self {
            env: env.clone(),
            contract_id,
        }
    }
}
