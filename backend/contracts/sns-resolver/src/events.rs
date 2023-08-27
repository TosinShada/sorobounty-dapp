use soroban_sdk::{Address, BytesN, Env, Symbol};

pub(crate) fn new_owner(e: &Env, owner: Address, node: BytesN<32>) {
    let topics = (Symbol::new(e, "new_owner"), owner);
    e.events().publish(topics, (node,));
}

pub(crate) fn transfer_owner(e: &Env, node: BytesN<32>, label: BytesN<32>, owner: Address) {
    let topics = (Symbol::new(e, "transfer_owner"), owner);
    e.events().publish(topics, (node, label));
}

pub(crate) fn set_approval_for_all(e: &Env, operator: Address, caller: Address, approved: bool) {
    let topics = (Symbol::new(e, "set_approval_for_all"), caller);
    e.events().publish(topics, (approved, operator));
}
