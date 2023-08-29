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

echo "Minting 100000000000000000 tokens to token-admin"
soroban contract invoke \
  $ARGS \
  --id "$TOKEN_ADDRESS" \
  -- \
  mint \
  --to "$ADMIN_ADDRESS" \
  --amount 100000000000000000

echo "Create stream in the streamdapp contract"
soroban contract invoke \
  $ARGS \
  --id "$STREAMDAPP_ID" \
  -- \
  create_stream \
  --sender "$ADMIN_ADDRESS" \
  --recipient "GCTQHL2YGRI35FZUL4Y6UBAJYSGCMFTVQIZAK5XRK4EYYY6SHABNLN5F" \
  --amount 345600000000 \
  --token_address "$TOKEN_ADDRESS" \
  --start_time 1693782000 \
  --stop_time 1693954800

echo "Done"