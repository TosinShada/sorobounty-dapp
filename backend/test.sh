#!/bin/bash

set -e

ADMIN_ADDRESS="$(soroban config identity address token-admin)"
NETWORK="$(cat ./.stream-payment-dapp/network)"
STREAMDAPP_ID="$(cat ./.stream-payment-dapp/streamdapp_id)"
TOKEN_ADDRESS="$(cat ./.stream-payment-dapp/mock_token_id)"

echo Add the network to cli client
soroban config network add \
  --rpc-url "https://rpc-futurenet.stellar.org:443" \
  --network-passphrase "Test SDF Future Network ; October 2022" "futurenet"

ARGS="--network $NETWORK --source token-admin"

echo "Minting 10,000,000.0000000 tokens to token-admin"
soroban contract invoke \
  $ARGS \
  --id "$TOKEN_ADDRESS" \
  -- \
  mint \
  --to "$ADMIN_ADDRESS" \
  --amount 1000000000000

echo "Done"