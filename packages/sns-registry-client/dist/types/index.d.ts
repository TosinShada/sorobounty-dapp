/// <reference types="node" />
import * as SorobanClient from 'soroban-client';
import { Buffer } from "buffer";
import type { ResponseTypes, Wallet } from './method-options.js';
export * from './constants.js';
export * from './server.js';
export * from './invoke.js';
export type u32 = number;
export type i32 = number;
export type u64 = bigint;
export type i64 = bigint;
export type u128 = bigint;
export type i128 = bigint;
export type u256 = bigint;
export type i256 = bigint;
export type Address = string;
export type Option<T> = T | undefined;
export type Typepoint = bigint;
export type Duration = bigint;
export interface Error_ {
    message: string;
}
export interface Result<T, E = Error_> {
    unwrap(): T;
    unwrapErr(): E;
    isOk(): boolean;
    isErr(): boolean;
}
export declare class Ok<T> implements Result<T> {
    readonly value: T;
    constructor(value: T);
    unwrapErr(): Error_;
    unwrap(): T;
    isOk(): boolean;
    isErr(): boolean;
}
export declare class Err<T> implements Result<T> {
    readonly error: Error_;
    constructor(error: Error_);
    unwrapErr(): Error_;
    unwrap(): never;
    isOk(): boolean;
    isErr(): boolean;
}
export type DataKey = {
    tag: "Records";
    values: [Buffer];
} | {
    tag: "Operators";
    values: [Address, Address];
} | {
    tag: "Admin";
    values: void;
};
export declare function initialize<R extends ResponseTypes = undefined>({ admin }: {
    admin: Address;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? void : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : void>;
export declare function setRecord<R extends ResponseTypes = undefined>({ caller, node, owner, resolver, ttl }: {
    caller: Address;
    node: Buffer;
    owner: Address;
    resolver: Address;
    ttl: u32;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? void : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : void>;
export declare function setOwner<R extends ResponseTypes = undefined>({ caller, node, owner }: {
    caller: Address;
    node: Buffer;
    owner: Address;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? void : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : void>;
export declare function setSubnodeOwner<R extends ResponseTypes = undefined>({ caller, node, label, owner }: {
    caller: Address;
    node: Buffer;
    label: Buffer;
    owner: Address;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? void : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : void>;
export declare function setResolver<R extends ResponseTypes = undefined>({ caller, node, resolver }: {
    caller: Address;
    node: Buffer;
    resolver: Address;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? void : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : void>;
export declare function setTtl<R extends ResponseTypes = undefined>({ caller, node, ttl }: {
    caller: Address;
    node: Buffer;
    ttl: u32;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? void : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : void>;
export declare function setApprovalForAll<R extends ResponseTypes = undefined>({ caller, operator, approved }: {
    caller: Address;
    operator: Address;
    approved: boolean;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? void : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : void>;
export declare function owner<R extends ResponseTypes = undefined>({ node }: {
    node: Buffer;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `Address`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? string : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : string>;
export declare function resolver<R extends ResponseTypes = undefined>({ node }: {
    node: Buffer;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `Address`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? string : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : string>;
export declare function ttl<R extends ResponseTypes = undefined>({ node }: {
    node: Buffer;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `u32`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? number : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : number>;
export declare function record<R extends ResponseTypes = undefined>({ node }: {
    node: Buffer;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `Record`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? Record : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : Record>;
export declare function recordExist<R extends ResponseTypes = undefined>({ node }: {
    node: Buffer;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `boolean`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? boolean : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : boolean>;
export declare function isApprovedForAll<R extends ResponseTypes = undefined>({ operator, owner }: {
    operator: Address;
    owner: Address;
}, options?: {
    /**
     * The fee to pay for the transaction. Default: 100.
     */
    fee?: number;
    /**
     * What type of response to return.
     *
     *   - `undefined`, the default, parses the returned XDR as `boolean`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
     *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
     *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
     */
    responseType?: R;
    /**
     * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
     */
    secondsToWait?: number;
    /**
     * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
     *
     * ```ts
     * import freighter from "@stellar/freighter-api";
     *
     * // later, when calling this function:
     *   wallet: freighter,
     */
    wallet?: Wallet;
}): Promise<R extends undefined ? boolean : R extends "simulated" ? SorobanClient.SorobanRpc.SimulateTransactionResponse : R extends "full" ? SorobanClient.SorobanRpc.SimulateTransactionResponse | SorobanClient.SorobanRpc.SendTransactionResponse | SorobanClient.SorobanRpc.GetTransactionResponse : boolean>;
export interface Record {
    owner: Address;
    resolver: Address;
    ttl: u32;
}
