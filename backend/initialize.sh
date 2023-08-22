#!/bin/bash

set -e

NETWORK="$1"

SOROBAN_RPC_HOST="$2"

PATH=./target/bin:$PATH

if [[ -f "./.stream-payment-dapp/streamdapp_id" ]]; then
  echo "Found existing './.stream-payment-dapp' directory; already initialized."
  exit 0
fi

if [[ -f "./target/bin/soroban" ]]; then
  echo "Using soroban binary from ./target/bin"
else
  echo "Building pinned soroban binary"
  cargo install_soroban
fi

if [[ "$SOROBAN_RPC_HOST" == "" ]]; then
  # If soroban-cli is called inside the soroban-preview docker container,
  # it can call the stellar standalone container just using its name "stellar"
  if [[ "$IS_USING_DOCKER" == "true" ]]; then
    SOROBAN_RPC_HOST="http://stellar:8000"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
  elif [[ "$NETWORK" == "futurenet" ]]; then
    SOROBAN_RPC_HOST="https://rpc-futurenet.stellar.org:443"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"
  else
     # assumes standalone on quickstart, which has the soroban/rpc path
    SOROBAN_RPC_HOST="http://localhost:8000"
    SOROBAN_RPC_URL="$SOROBAN_RPC_HOST/soroban/rpc"
  fi
else 
  SOROBAN_RPC_URL="$SOROBAN_RPC_HOST"  
fi

case "$1" in
standalone)
  SOROBAN_NETWORK_PASSPHRASE="Standalone Network ; February 2017"
  FRIENDBOT_URL="$SOROBAN_RPC_HOST/friendbot"
  ;;
futurenet)
  SOROBAN_NETWORK_PASSPHRASE="Test SDF Future Network ; October 2022"
  FRIENDBOT_URL="https://friendbot-futurenet.stellar.org/"
  ;;
*)
  echo "Usage: $0 standalone|futurenet [rpc-host]"
  exit 1
  ;;
esac

echo "Using $NETWORK network"
echo "  RPC URL: $SOROBAN_RPC_URL"
echo "  Friendbot URL: $FRIENDBOT_URL"

echo Add the $NETWORK network to cli client
soroban config network add \
  --rpc-url "$SOROBAN_RPC_URL" \
  --network-passphrase "$SOROBAN_NETWORK_PASSPHRASE" "$NETWORK"

echo Add $NETWORK to .stream-payment-dapp for use with npm scripts
mkdir -p .stream-payment-dapp
echo $NETWORK > ./.stream-payment-dapp/network
echo $SOROBAN_RPC_URL > ./.stream-payment-dapp/rpc-url
echo "$SOROBAN_NETWORK_PASSPHRASE" > ./.stream-payment-dapp/passphrase

if !(soroban config identity ls | grep token-admin 2>&1 >/dev/null); then
  echo Create the token-admin identity
  soroban config identity generate token-admin
fi
MOCK_TOKEN_ADMIN_ADDRESS="$(soroban config identity address token-admin)"

# This will fail if the account already exists, but it'll still be fine.
echo Fund token-admin account from friendbot
curl --silent -X POST "$FRIENDBOT_URL?addr=$MOCK_TOKEN_ADMIN_ADDRESS" >/dev/null

ARGS="--network $NETWORK --source token-admin"

echo Build contracts
make build

echo Deploy the mock token contract
MOCK_TOKEN_ID="$(
  soroban contract deploy $ARGS \
    --wasm target/wasm32-unknown-unknown/release/mock_token.wasm
)"
echo "Contract deployed succesfully with ID: $MOCK_TOKEN_ID"
echo -n "$MOCK_TOKEN_ID" > .stream-payment-dapp/mock_token_id

echo Deploy the streamdapp contract
STREAMDAPP_ID="$(
  soroban contract deploy $ARGS \
    --wasm target/wasm32-unknown-unknown/release/soroban_stream_contract.wasm
)"
echo "Contract deployed succesfully with ID: $STREAMDAPP_ID"
echo "$STREAMDAPP_ID" > .stream-payment-dapp/streamdapp_id

echo "Initialize the mock token contract"
soroban contract invoke \
  $ARGS \
  --id "$MOCK_TOKEN_ID" \
  -- \
  initialize \
  --symbol MCKT \
  --decimal 7 \
  --name mock_token \
  --admin "$MOCK_TOKEN_ADMIN_ADDRESS"

echo "Minting 1000000000 tokens to token-admin"
soroban contract invoke \
  $ARGS \
  --id "$MOCK_TOKEN_ID" \
  -- \
  mint \
  --to "$MOCK_TOKEN_ADMIN_ADDRESS" \
  --amount 1000000000

echo "Initialize the streamdapp contract"
soroban contract invoke \
  $ARGS \
  --id "$STREAMDAPP_ID" \
  -- \
  initialize \
  --token "$MOCK_TOKEN_ID" \
  --start_id "10000" 
echo "Done"
