#![cfg(test)]

extern crate std;
use std::println;

use super::testutils::{register_test_contract as register_streamtoken, StreamToken};
use soroban_sdk::{
    testutils::{Address as AddressTestTrait, Events, Ledger},
    token, vec, Address, Env, IntoVal, Symbol, Val, Vec,
};

fn create_streamtoken_contract(e: &Env, token: &Address) -> (Address, StreamToken) {
    let id = register_streamtoken(e);
    let streamtoken = StreamToken::new(e, id.clone());
    streamtoken.client().initialize(token, &100);
    (id, streamtoken)
}

fn advance_ledger(e: &Env, delta: u64) {
    e.ledger().with_mut(|l| {
        l.timestamp += delta;
    });
}

struct Setup<'a> {
    env: Env,
    user1: Address,
    user2: Address,
    token: token::Client<'a>,
    streamtoken: StreamToken,
    streamtoken_id: Address,
    stream_id: u32,
}

fn create_token_contract<'a>(
    e: &Env,
    admin: &Address,
) -> (token::Client<'a>, token::AdminClient<'a>) {
    let contract_address = e.register_stellar_asset_contract(admin.clone());
    (
        token::Client::new(e, &contract_address),
        token::AdminClient::new(e, &contract_address),
    )
}

/// Sets up a streamtoken with -
///
impl Setup<'_> {
    fn new() -> Self {
        let e: Env = soroban_sdk::Env::default();
        let user1 = Address::random(&e);
        let user2 = Address::random(&e);

        // the deadline is 10 seconds from now
        let timestamp = e.ledger().timestamp();
        let deadline = timestamp + 10;

        // Create the token contract
        let token_admin = Address::random(&e);
        let (token, token_admin) = create_token_contract(&e, &token_admin);

        // Create the streamtokening contract
        let (streamtoken_id, streamtoken) = create_streamtoken_contract(&e, &token.address);

        // Mint some tokens to work with
        token_admin.mock_all_auths().mint(&user1, &100);
        token_admin.mock_all_auths().mint(&user2, &80);

        let stream_id = streamtoken.client().mock_all_auths().create_stream(
            &user1,
            &user2,
            &50,
            &token.address,
            &timestamp,
            &deadline,
        );

        Self {
            env: e,
            user1,
            user2,
            token,
            streamtoken,
            streamtoken_id,
            stream_id,
        }
    }
}

#[test]
fn test_balance_of() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 6);

    let user1_balance = setup
        .streamtoken
        .client()
        .balance_of(&setup.stream_id, &setup.user1);

    let user2_balance = setup
        .streamtoken
        .client()
        .balance_of(&setup.stream_id, &setup.user2);

    assert_eq!(user1_balance, 20);
    assert_eq!(user2_balance, 30);
}

#[test]
fn test_get_stream() {
    let setup = Setup::new();

    let stream = setup
        .streamtoken
        .client()
        .mock_all_auths()
        .get_stream(&setup.stream_id);

    assert_eq!(stream.deposit, 50);
    assert_eq!(stream.stop_time, 10);
    assert_eq!(stream.rate_per_second, 5);
    assert_eq!(stream.remaining_balance, 50);
}

#[test]
fn test_get_stream_by_user() {
    let setup = Setup::new();

    let stream = setup
        .streamtoken
        .client()
        .mock_all_auths()
        .get_streams_by_user(&setup.user1);

    println!("{:?}", stream);

    assert_eq!(stream.len(), 50);
}

#[test]
fn test_withdraw_from_stream() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 6);

    let old_balance = setup
        .streamtoken
        .client()
        .mock_all_auths()
        .balance_of(&setup.stream_id, &setup.user2);

    assert_eq!(old_balance, 30);
    assert_eq!(setup.token.mock_all_auths().balance(&setup.user2), 80);

    setup
        .streamtoken
        .client()
        .mock_all_auths()
        .withdraw_from_stream(&setup.user2, &setup.stream_id, &10);

    let new_balance = setup
        .streamtoken
        .client()
        .mock_all_auths()
        .balance_of(&setup.stream_id, &setup.user2);

    assert_eq!(new_balance, 20);
    assert_eq!(setup.token.mock_all_auths().balance(&setup.user2), 90);
}

#[test]
fn test_cancel_stream() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 6);

    assert_eq!(
        setup
            .streamtoken
            .client()
            .mock_all_auths()
            .balance_of(&setup.stream_id, &setup.user2),
        30
    );
    assert_eq!(
        setup
            .streamtoken
            .client()
            .mock_all_auths()
            .balance_of(&setup.stream_id, &setup.user1),
        20
    );
    assert_eq!(setup.token.mock_all_auths().balance(&setup.user1), 50);
    assert_eq!(setup.token.mock_all_auths().balance(&setup.user2), 80);

    setup
        .streamtoken
        .client()
        .mock_all_auths()
        .cancel_stream(&setup.user1, &setup.stream_id);

    assert_eq!(setup.token.mock_all_auths().balance(&setup.user1), 70);
    assert_eq!(setup.token.mock_all_auths().balance(&setup.user2), 110);
}

// #[test]
// fn test_events() {
//     let setup = Setup::new();

//     advance_ledger(&setup.env, 6);

//     setup
//         .streamtoken
//         .client()
//         .mock_all_auths()
//         .withdraw_from_stream(&setup.user2, &setup.stream_id, &10);
//     setup
//         .streamtoken
//         .client()
//         .mock_all_auths()
//         .cancel_stream(&setup.user1, &setup.stream_id);

//     let mut stream_token_events: Vec<(Address, soroban_sdk::Vec<Val>, Val)> = vec![&setup.env];

//     // there are SAC events emitted also, filter those away, not asserting that aspect
//     setup
//         .env
//         .events()
//         .all()
//         .iter()
//         .filter(|event| event.0 == setup.streamtoken_id)
//         .for_each(|event| stream_token_events.push_back(event));

//     println!("{:?}", stream_token_events);

//     assert_eq!(
//         stream_token_events,
//         vec![
//             &setup.env,
//             (
//                 setup.streamtoken_id.clone(),
//                 (Symbol::new(&setup.env, "pledged_amount_changed"),).into_val(&setup.env),
//                 10_i128.into_val(&setup.env)
//             ),
//             (
//                 setup.streamtoken_id.clone(),
//                 (Symbol::new(&setup.env, "pledged_amount_changed"),).into_val(&setup.env),
//                 15_i128.into_val(&setup.env)
//             ),
//             (
//                 setup.streamtoken_id.clone(),
//                 (Symbol::new(&setup.env, "target_reached"),).into_val(&setup.env),
//                 (15_i128, 15_i128).into_val(&setup.env)
//             ),
//             (
//                 setup.streamtoken_id.clone(),
//                 (Symbol::new(&setup.env, "pledged_amount_changed"),).into_val(&setup.env),
//                 18_i128.into_val(&setup.env)
//             ),
//         ]
//     );
// }

// #[test]
// #[should_panic(expected = "sale is still running")]
// fn sale_still_running() {
//     let setup = Setup::new();
//     setup
//         .streamtoken
//         .client()
//         .mock_all_auths()
//         .withdraw(&setup.recipient);
// }
