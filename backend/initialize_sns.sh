#!/bin/bash

set -e

NETWORK="$1"

SOROBAN_RPC_HOST="$2"

PATH=./target/bin:$PATH

if [[ -f "./.sns-dapp/snsdapp_id" ]]; then
  echo "Found existing './.sns-dapp' directory; already initialized."
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

echo Add $NETWORK to .sns-dapp for use with npm scripts
mkdir -p .sns-dapp
echo $NETWORK > ./.sns-dapp/network
echo $SOROBAN_RPC_URL > ./.sns-dapp/rpc-url
echo "$SOROBAN_NETWORK_PASSPHRASE" > ./.sns-dapp/passphrase

if !(soroban config identity ls | grep token-admin 2>&1 >/dev/null); then
  echo Create the admin identity
  soroban config identity generate token-admin
fi
ADMIN_ADDRESS="$(soroban config identity address token-admin)"

# This will fail if the account already exists, but it'll still be fine.
echo Fund admin account from friendbot
curl --silent -X POST "$FRIENDBOT_URL?addr=$ADMIN_ADDRESS" >/dev/null

ARGS="--network $NETWORK --source token-admin"

echo Build contracts
make build

echo Deploy the SNS Registry contract
SNS_REGISTRY_ID="$(
  soroban contract deploy $ARGS \
    --wasm target/wasm32-unknown-unknown/release/sns_registry.wasm
)"
echo "Contract deployed succesfully with ID: $SNS_REGISTRY_ID"
echo -n "$SNS_REGISTRY_ID" > .sns-dapp/sns_registry_id

echo Deploy the SNS Registrar contract
SNS_REGISTRAR_ID="$(
  soroban contract deploy $ARGS \
    --wasm target/wasm32-unknown-unknown/release/sns_registrar.wasm
)"
echo "Contract deployed succesfully with ID: $SNS_REGISTRAR_ID"
echo "$SNS_REGISTRAR_ID" > .sns-dapp/sns_registrar_id

echo Deploy the SNS Resolver contract
SNS_RESOLVER_ID="$(
  soroban contract deploy $ARGS \
    --wasm target/wasm32-unknown-unknown/release/sns_resolver.wasm
)"
echo "Contract deployed succesfully with ID: $SNS_RESOLVER_ID"
echo "$SNS_RESOLVER_ID" > .sns-dapp/sns_resolver_id

echo "Initialize the registry contract"
soroban contract invoke \
  $ARGS \
  --id "$SNS_REGISTRY_ID" \
  -- \
  initialize \
  --admin "$SNS_REGISTRAR_ID"

## Base node is the SHA256 hash of the string "sns" 
echo "Initialize the registrar contract"
soroban contract invoke \
  $ARGS \
  --id "$SNS_REGISTRAR_ID" \
  -- \
  initialize \
  --registry "$SNS_REGISTRY_ID" \
  --admin "$ADMIN_ADDRESS" \
  --base_node b018ed7bff94dbb0ed23e266a3c6ca9d1a1739737db49ec48ea1980b9db0ad46

echo "Initialize the resolver contract"
soroban contract invoke \
  $ARGS \
  --id "$SNS_RESOLVER_ID" \
  -- \
  initialize \
  --admin "$ADMIN_ADDRESS"

echo "add controller to the registrar contract"
soroban contract invoke \
  $ARGS \
  --id "$SNS_REGISTRAR_ID" \
  -- \
  add_controller \
  --caller "$ADMIN_ADDRESS" \
  --controller "$ADMIN_ADDRESS"

echo "Add the base record for the registrar"
soroban contract invoke \
  $ARGS \
  --id "$SNS_REGISTRAR_ID" \
  -- \
  set_record \
  --caller "$ADMIN_ADDRESS" \
  --owner "$SNS_REGISTRAR_ID" \
  --resolver "$SNS_RESOLVER_ID" \
  --ttl 3600

echo "Register a new SNS"
soroban contract invoke \
  $ARGS \
  --id "$SNS_REGISTRAR_ID" \
  -- \
  register \
  --caller "$ADMIN_ADDRESS" \
  --owner "$ADMIN_ADDRESS" \
  --name 67741aa8c74ef6ef3c1449cb2c42753aa69817f7019950eee67ea9a5ecf1fa0e \
  --duration 31536000 

echo "Done"
