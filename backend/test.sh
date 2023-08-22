#!/bin/bash

set -e

MOCK_TOKEN_ADMIN_ADDRESS="$(soroban config identity address token-admin)"
NETWORK="$(cat ./.stream-payment-dapp/network)"
TOKEN_ADDRESS="$(cat ./.stream-payment-dapp/mock_token_id)"
STREAMDAPP_ADDRESS="$(cat ./.stream-payment-dapp/streamdapp_id)"

echo Add the network to cli client
soroban config network add \
  --rpc-url "https://rpc-futurenet.stellar.org:443" \
  --network-passphrase "Test SDF Future Network ; October 2022" "futurenet"

echo "Create stream"
start_time="$(($(date +"%s") + 100))"
stop_time="$(($(date +"%s") + 500))"
soroban contract invoke \
  --network $NETWORK \
  --source token-admin \
  --id "$STREAMDAPP_ADDRESS" \
  -- \
  create_stream \
  --sender "$MOCK_TOKEN_ADMIN_ADDRESS" \
  --recipient "GADBBUM6UKJZNUKFII2L5YXZM4LIWINRTF7HTQI2YHMDH23MQGIKRLTQ" \
  --amount 34560000 \
  --token_address "$TOKEN_ADDRESS" \
  --start_time 1692658800 \
  --stop_time 1692831600

echo "Get stream by user"
soroban contract invoke \
  --network $NETWORK \
  --source token-admin \
  --id "$STREAMDAPP_ADDRESS" \
  -- \
  get_streams_by_user \
  --caller "$MOCK_TOKEN_ADMIN_ADDRESS"

echo "Done"