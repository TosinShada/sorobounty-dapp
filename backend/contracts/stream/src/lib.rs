#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Vec};

mod events;
mod test;
mod testutils;

pub(crate) const BUMP_AMOUNT: u32 = 518400; // 30 days
pub(crate) const INSTANCE_BUMP_AMOUNT: u32 = 34560; // 2 days

#[derive(Clone, Debug)]
#[contracttype]
pub struct Stream {
    pub id: u32,
    pub sender: Address,
    pub recipient: Address,
    pub start_time: u64,
    pub stop_time: u64,
    pub deposit: i128,
    pub rate_per_second: u64,
    pub remaining_balance: i128,
    pub token_address: Address,
    pub token_symbol: String,
    pub token_decimals: u32,
}

#[contracttype]
pub struct LocalBalance {
    pub recipient_balance: i128,
    pub withdrawal_amount: i128,
    pub sender_balance: i128,
}

#[contracttype]
pub struct CreateStream {
    pub duration: u64,
    pub rate_per_second: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Token,
    NextStreamId,
    Streams(u32),
    UserStreams(Address),
}

/*
Getter Functions
*/
fn get_ledger_timestamp(e: &Env) -> u64 {
    e.ledger().timestamp()
}

fn get_stream(e: &Env, stream_id: &u32) -> Stream {
    e.storage()
        .persistent()
        .get::<_, Stream>(&DataKey::Streams(stream_id.clone()))
        .expect("invalid stream id")
}

fn get_streams_by_user(e: &Env, who: &Address) -> Vec<Stream> {
    e.storage()
        .persistent()
        .get::<_, Vec<Stream>>(&DataKey::UserStreams(who.clone()))
        .unwrap_or(Vec::new(&e))
}

fn get_next_stream_id(e: &Env) -> u32 {
    e.storage()
        .instance()
        .get::<_, u32>(&DataKey::NextStreamId)
        .expect("not initialized")
}

fn get_token(e: &Env) -> Address {
    e.storage()
        .instance()
        .get::<_, Address>(&DataKey::Token)
        .expect("not initialized")
}

fn get_delta_of(start_time: &u64, stop_time: &u64, current_ledger_time: &u64) -> u64 {
    if current_ledger_time < start_time {
        return 0;
    }
    if current_ledger_time >= stop_time {
        return stop_time - start_time;
    }
    return current_ledger_time - start_time;
}

fn get_balance_of(e: &Env, caller: &Address, stream: &Stream) -> i128 {
    let start_time = stream.start_time;
    let stop_time = stream.stop_time;
    let current_ledger_time = get_ledger_timestamp(&e);
    let delta = get_delta_of(&start_time, &stop_time, &current_ledger_time);

    let mut local_balance = LocalBalance {
        recipient_balance: 0,
        withdrawal_amount: 0,
        sender_balance: 0,
    };
    local_balance.recipient_balance = (delta * stream.rate_per_second) as i128;

    // If the stream `balance` does not equal `deposit`, it means there have been withdrawals.
    // We have to subtract the total amount withdrawn from the amount of money that has been streamed until now.
    if stream.deposit > stream.remaining_balance {
        local_balance.withdrawal_amount = stream.deposit - stream.remaining_balance;
        check_nonnegative_amount(local_balance.withdrawal_amount);
        local_balance.recipient_balance =
            local_balance.recipient_balance - local_balance.withdrawal_amount;
        check_nonnegative_amount(local_balance.recipient_balance);
    }

    if caller.clone() == stream.recipient {
        local_balance.recipient_balance
    } else if caller.clone() == stream.sender {
        local_balance.sender_balance = stream.remaining_balance - local_balance.recipient_balance;
        check_nonnegative_amount(local_balance.sender_balance);
        local_balance.sender_balance
    } else {
        0
    }
}

/*
Modifiers for the contract
*/
fn require_sender_or_recipient(stream: &Stream, user: &Address) {
    let sender = &(stream.sender);
    let recipient = &(stream.recipient);
    assert!(
        user == sender || user == recipient,
        "only sender or recipient can call this function"
    );
}

fn check_nonnegative_amount(amount: i128) {
    if amount < 0 {
        panic!("negative amount is not allowed: {}", amount)
    }
}

// Transfer tokens from the contract to the recipient
fn transfer(e: &Env, to: &Address, amount: &i128) {
    let token_contract_id = &get_token(e);
    let client = token::Client::new(e, token_contract_id);
    client.transfer(&e.current_contract_address(), to, amount);
}

fn set_stream(e: &Env, stream_id: &u32, stream: &Stream) {
    e.storage()
        .persistent()
        .set(&DataKey::Streams(stream_id.clone()), stream);
    e.storage()
        .persistent()
        .bump(&DataKey::Streams(stream_id.clone()), BUMP_AMOUNT);
}

fn set_stream_by_user(e: &Env, who: &Address, stream: &Stream) {
    // Get the array of streams for the user
    let mut streams = get_streams_by_user(&e, &who);
    streams.push_back(stream.clone());
    e.storage()
        .persistent()
        .set(&DataKey::UserStreams(who.clone()), &streams);
    e.storage()
        .persistent()
        .bump(&DataKey::UserStreams(who.clone()), BUMP_AMOUNT);
}

fn set_next_stream_id(e: &Env, stream_id: &u32) {
    e.storage()
        .instance()
        .set(&DataKey::NextStreamId, &(stream_id + 1));
    e.storage().instance().bump(INSTANCE_BUMP_AMOUNT);
}

fn remove_stream(e: &Env, stream_id: &u32) {
    e.storage()
        .persistent()
        .remove(&DataKey::Streams(stream_id.clone()));
}

#[contract]
struct StreamToken;

#[contractimpl]
#[allow(clippy::needless_pass_by_value)]
impl StreamToken {
    pub fn initialize(e: Env, token: Address, start_id: u32) {
        assert!(
            !e.storage().instance().has(&DataKey::NextStreamId),
            "already initialized"
        );
        e.storage()
            .instance()
            .set(&DataKey::NextStreamId, &start_id);
        e.storage().instance().set(&DataKey::Token, &token);
        e.storage().instance().bump(INSTANCE_BUMP_AMOUNT);
    }

    pub fn get_stream(e: Env, stream_id: u32) -> Stream {
        get_stream(&e, &stream_id)
    }

    pub fn get_streams_by_user(e: Env, caller: Address) -> Vec<Stream> {
        get_streams_by_user(&e, &caller)
    }

    /// Returns either the delta in seconds between `ledger.timestamp` and `startTime` or between `stopTime` and `startTime, whichever is smaller.
    /// If `block.timestamp` is before `startTime`, it returns 0.
    /// Panics if the id does not point to a valid stream.
    pub fn delta_of(e: Env, stream_id: u32) -> u64 {
        let stream = get_stream(&e, &stream_id);
        let start_time = stream.start_time;
        let stop_time = stream.stop_time;
        let current_ledger_time = get_ledger_timestamp(&e);

        get_delta_of(&start_time, &stop_time, &current_ledger_time)
    }

    /// Returns the amount of tokens that have already been released to the recipient.
    /// Panics if the id does not point to a valid stream.
    /// @param stream_id The id of the stream
    /// @param who The address of the caller
    /// @return The amount of tokens that have already been released
    pub fn balance_of(e: Env, stream_id: u32, caller: Address) -> i128 {
        let stream = get_stream(&e, &stream_id);

        get_balance_of(&e, &caller, &stream)
    }

    // convert the above solidity function to soroban
    pub fn create_stream(
        e: Env,
        sender: Address,
        recipient: Address,
        amount: i128,
        token_address: Address,
        start_time: u64,
        stop_time: u64,
    ) -> u32 {
        sender.require_auth();
        assert!(
            recipient != e.current_contract_address(),
            "stream to the contract itself"
        );
        assert!(recipient != sender, "stream to the caller");
        assert!(amount > 0, "amount is zero or negative");
        assert!(
            start_time >= get_ledger_timestamp(&e),
            "start time before ledger.timestamp"
        );
        assert!(stop_time > start_time, "stop time before the start time");

        let mut create_stream = CreateStream {
            duration: 0,
            rate_per_second: 0,
        };

        create_stream.duration = stop_time - start_time;
        assert!(
            amount >= create_stream.duration as i128,
            "amount smaller than time delta"
        );
        assert!(
            amount % create_stream.duration as i128 == 0,
            "amount not multiple of time delta"
        );

        create_stream.rate_per_second = amount as u64 / create_stream.duration;

        let stream_id = get_next_stream_id(&e);

        let token_contract_id = get_token(&e);
        let client = token::Client::new(&e, &token_contract_id);
        client.transfer(&sender, &e.current_contract_address(), &amount);

        let token_symbol = client.symbol();
        let token_decimals = client.decimals();

        let stream = Stream {
            id: stream_id.clone(),
            sender: sender.clone(),
            recipient: recipient.clone(),
            start_time: start_time,
            stop_time: stop_time,
            deposit: amount,
            rate_per_second: create_stream.rate_per_second,
            remaining_balance: amount,
            token_address: token_address.clone(),
            token_symbol: token_symbol.clone(),
            token_decimals: token_decimals.clone(),
        };

        set_stream(&e, &stream_id, &stream);
        set_stream_by_user(&e, &sender, &stream);
        set_stream_by_user(&e, &recipient, &stream);
        set_next_stream_id(&e, &stream_id);

        events::create_stream(
            &e,
            stream_id.clone(),
            sender,
            recipient,
            amount,
            token_address,
            token_symbol,
            token_decimals,
            start_time,
            stop_time,
        );
        stream_id
    }

    pub fn withdraw_from_stream(e: Env, recipient: Address, stream_id: u32, amount: i128) {
        recipient.require_auth();
        assert!(amount > 0, "amount is zero or negative");
        assert!(
            recipient != e.current_contract_address(),
            "stream to the contract itself"
        );

        let mut stream = get_stream(&e, &stream_id);
        require_sender_or_recipient(&stream, &recipient);

        let balance = get_balance_of(&e, &recipient, &stream);
        assert!(balance >= amount, "amount exceeds the available balance");

        stream.remaining_balance = stream.remaining_balance - amount;

        if stream.remaining_balance == 0 {
            remove_stream(&e, &stream_id);
        } else {
            set_stream(&e, &stream_id, &stream);
        }

        transfer(&e, &recipient, &amount);

        events::withdraw_from_stream(&e, recipient, stream_id, amount);
    }

    /// Cancels the stream and transfers the tokens back on a pro rata basis.
    /// Throws if the id does not point to a valid stream.
    /// Throws if the caller is not the sender or the recipient of the stream.
    /// Throws if there is a token transfer failure.
    /// @param stream_id The id of the stream to cancel.
    /// @return bool true=success, otherwise false.
    pub fn cancel_stream(e: Env, caller: Address, stream_id: u32) {
        caller.require_auth();
        let stream = get_stream(&e, &stream_id);
        require_sender_or_recipient(&stream, &caller);

        let sender_balance = get_balance_of(&e, &stream.sender, &stream);
        let recipient_balance = get_balance_of(&e, &stream.recipient, &stream);

        remove_stream(&e, &stream_id);

        if recipient_balance > 0 {
            transfer(&e, &stream.recipient, &recipient_balance);
        }
        if sender_balance > 0 {
            transfer(&e, &stream.sender, &sender_balance);
        }

        events::cancel_stream(
            &e,
            stream_id,
            stream.sender,
            stream.recipient,
            sender_balance,
            recipient_balance,
        );
    }
}
