#![cfg(test)]

use crate::SnsRegistryClient;

use soroban_sdk::{Address, Env};

pub fn register_test_contract(e: &Env) -> Address {
    e.register_contract(None, crate::SnsRegistry {})
}

pub struct SnsRegistry {
    env: Env,
    contract_id: Address,
}

impl SnsRegistry {
    #[must_use]
    pub fn client(&self) -> SnsRegistryClient {
        SnsRegistryClient::new(&self.env, &self.contract_id)
    }

    #[must_use]
    pub fn new(env: &Env, contract_id: Address) -> Self {
        Self {
            env: env.clone(),
            contract_id,
        }
    }
}
