#!/bin/bash

set -e

ADMIN_ADDRESS="$(soroban config identity address token-admin)"
NETWORK="$(cat ./.sns-dapp/network)"
SNS_REGISTRAR_ID="$(cat ./.sns-dapp/sns_registrar_id)"
SNS_REGISTRY_ID="$(cat ./.sns-dapp/sns_registry_id)"
SNS_RESOLVER_ID="$(cat ./.sns-dapp/sns_resolver_id)"

echo Add the network to cli client
soroban config network add \
  --rpc-url "https://rpc-futurenet.stellar.org:443" \
  --network-passphrase "Test SDF Future Network ; October 2022" "futurenet"

ARGS="--network $NETWORK --source token-admin"

echo "Register a new SNS"
soroban contract invoke \
  $ARGS \
  --id "$SNS_REGISTRAR_ID" \
  -- \
  register \
  --caller "$ADMIN_ADDRESS" \
  --owner "GADBBUM6UKJZNUKFII2L5YXZM4LIWINRTF7HTQI2YHMDH23MQGIKRLTQ" \
  --name 9fbf261b62c1d7c00db73afb81dd97fdf20b3442e36e338cb9359b856a03bdc8 \
  --duration 31536000 

echo "Set Name in Resolver"
soroban contract invoke \
  $ARGS \
  --id "$SNS_RESOLVER_ID" \
  -- \
  set_name \
  --caller "$ADMIN_ADDRESS" \
  --node 9fbf261b62c1d7c00db73afb81dd97fdf20b3442e36e338cb9359b856a03bdc8 \
  --name GADBBUM6UKJZNUKFII2L5YXZM4LIWINRTF7HTQI2YHMDH23MQGIKRLTQ

echo "Check name availability"
soroban contract invoke \
  $ARGS \
  --id "$SNS_REGISTRAR_ID" \
  -- \
  available \
  --name 9fbf261b62c1d7c00db73afb81dd97fdf20b3442e36e338cb9359b856a03bdc8 

echo "Done"
