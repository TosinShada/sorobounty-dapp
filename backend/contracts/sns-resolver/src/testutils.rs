#![cfg(test)]

use crate::SnsResolverClient;
use soroban_sdk::{Address, Env};

pub fn register_test_contract(e: &Env) -> Address {
    e.register_contract(None, crate::SnsResolver {})
}

pub struct SnsResolver {
    env: Env,
    contract_id: Address,
}

impl SnsResolver {
    #[must_use]
    pub fn client(&self) -> SnsResolverClient {
        SnsResolverClient::new(&self.env, &self.contract_id)
    }

    #[must_use]
    pub fn new(env: &Env, contract_id: Address) -> Self {
        Self {
            env: env.clone(),
            contract_id,
        }
    }
}
