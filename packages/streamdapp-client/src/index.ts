import * as SorobanClient from 'soroban-client';
import { xdr } from 'soroban-client';
import { Buffer } from "buffer";
import { scValStrToJs, scValToJs, addressToScVal, u128ToScVal, i128ToScVal, strToScVal } from './convert.js';
import { invoke } from './invoke.js';
import type { ResponseTypes, Wallet } from './method-options.js'

export * from './constants.js'
export * from './server.js'
export * from './invoke.js'

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

/// Error interface containing the error message
export interface Error_ { message: string };

export interface Result<T, E = Error_> {
    unwrap(): T,
    unwrapErr(): E,
    isOk(): boolean,
    isErr(): boolean,
};

export class Ok<T> implements Result<T> {
    constructor(readonly value: T) { }
    unwrapErr(): Error_ {
        throw new Error('No error');
    }
    unwrap(): T {
        return this.value;
    }

    isOk(): boolean {
        return true;
    }

    isErr(): boolean {
        return !this.isOk()
    }
}

export class Err<T> implements Result<T> {
    constructor(readonly error: Error_) { }
    unwrapErr(): Error_ {
        return this.error;
    }
    unwrap(): never {
        throw new Error(this.error.message);
    }

    isOk(): boolean {
        return false;
    }

    isErr(): boolean {
        return !this.isOk()
    }
}

if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}

const regex = /ContractError\((\d+)\)/;

function getError(err: string): Err<Error_> | undefined {
    const match = err.match(regex);
    if (!match) {
        return undefined;
    }
    if (Errors == undefined) {
        return undefined;
    }
    // @ts-ignore
    let i = parseInt(match[1], 10);
    if (i < Errors.length) {
        return new Err(Errors[i]!);
    }
    return undefined;
}

export interface Stream {
  deposit: i128;
  id: u32;
  rate_per_second: u64;
  recipient: Address;
  remaining_balance: i128;
  sender: Address;
  start_time: u64;
  stop_time: u64;
  token_address: Address;
  token_decimals: u32;
  token_symbol: string;
}

function StreamToXdr(stream?: Stream): xdr.ScVal {
    if (!stream) {
        return xdr.ScVal.scvVoid();
    }
    let arr = [
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("deposit"), val: ((i)=>i128ToScVal(i))(stream["deposit"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("id"), val: ((i)=>xdr.ScVal.scvU32(i))(stream["id"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("rate_per_second"), val: ((i)=>xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(stream["rate_per_second"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("recipient"), val: ((i)=>addressToScVal(i))(stream["recipient"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("remaining_balance"), val: ((i)=>i128ToScVal(i))(stream["remaining_balance"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("sender"), val: ((i)=>addressToScVal(i))(stream["sender"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("start_time"), val: ((i)=>xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(stream["start_time"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("stop_time"), val: ((i)=>xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(stream["stop_time"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("token_address"), val: ((i)=>addressToScVal(i))(stream["token_address"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("token_decimals"), val: ((i)=>xdr.ScVal.scvU32(i))(stream["token_decimals"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("token_symbol"), val: ((i)=>xdr.ScVal.scvString(i))(stream["token_symbol"])})
        ];
    return xdr.ScVal.scvMap(arr);
}


function StreamFromXdr(base64Xdr: string): Stream {
    let scVal = strToScVal(base64Xdr);
    let obj: [string, any][] = scVal.map()!.map(e => [e.key().str() as string, e.val()]);
    let map = new Map<string, any>(obj);
    if (!obj) {
        throw new Error('Invalid XDR');
    }
    return {
        deposit: scValToJs(map.get("deposit")) as unknown as i128,
        id: scValToJs(map.get("id")) as unknown as u32,
        rate_per_second: scValToJs(map.get("rate_per_second")) as unknown as u64,
        recipient: scValToJs(map.get("recipient")) as unknown as Address,
        remaining_balance: scValToJs(map.get("remaining_balance")) as unknown as i128,
        sender: scValToJs(map.get("sender")) as unknown as Address,
        start_time: scValToJs(map.get("start_time")) as unknown as u64,
        stop_time: scValToJs(map.get("stop_time")) as unknown as u64,
        token_address: scValToJs(map.get("token_address")) as unknown as Address,
        token_decimals: scValToJs(map.get("token_decimals")) as unknown as u32,
        token_symbol: scValToJs(map.get("token_symbol")) as unknown as string
    };
}

export interface LocalBalance {
  recipient_balance: i128;
  sender_balance: i128;
  withdrawal_amount: i128;
}

function LocalBalanceToXdr(localBalance?: LocalBalance): xdr.ScVal {
    if (!localBalance) {
        return xdr.ScVal.scvVoid();
    }
    let arr = [
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("recipient_balance"), val: ((i)=>i128ToScVal(i))(localBalance["recipient_balance"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("sender_balance"), val: ((i)=>i128ToScVal(i))(localBalance["sender_balance"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("withdrawal_amount"), val: ((i)=>i128ToScVal(i))(localBalance["withdrawal_amount"])})
        ];
    return xdr.ScVal.scvMap(arr);
}


function LocalBalanceFromXdr(base64Xdr: string): LocalBalance {
    let scVal = strToScVal(base64Xdr);
    let obj: [string, any][] = scVal.map()!.map(e => [e.key().str() as string, e.val()]);
    let map = new Map<string, any>(obj);
    if (!obj) {
        throw new Error('Invalid XDR');
    }
    return {
        recipient_balance: scValToJs(map.get("recipient_balance")) as unknown as i128,
        sender_balance: scValToJs(map.get("sender_balance")) as unknown as i128,
        withdrawal_amount: scValToJs(map.get("withdrawal_amount")) as unknown as i128
    };
}

export interface CreateStream {
  duration: u64;
  rate_per_second: u64;
}

function CreateStreamToXdr(createStream?: CreateStream): xdr.ScVal {
    if (!createStream) {
        return xdr.ScVal.scvVoid();
    }
    let arr = [
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("duration"), val: ((i)=>xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(createStream["duration"])}),
        new xdr.ScMapEntry({key: ((i)=>xdr.ScVal.scvSymbol(i))("rate_per_second"), val: ((i)=>xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(createStream["rate_per_second"])})
        ];
    return xdr.ScVal.scvMap(arr);
}


function CreateStreamFromXdr(base64Xdr: string): CreateStream {
    let scVal = strToScVal(base64Xdr);
    let obj: [string, any][] = scVal.map()!.map(e => [e.key().str() as string, e.val()]);
    let map = new Map<string, any>(obj);
    if (!obj) {
        throw new Error('Invalid XDR');
    }
    return {
        duration: scValToJs(map.get("duration")) as unknown as u64,
        rate_per_second: scValToJs(map.get("rate_per_second")) as unknown as u64
    };
}

export type DataKey = {tag: "Token", values: void} | {tag: "NextStreamId", values: void} | {tag: "Streams", values: [u32]} | {tag: "UserStreams", values: [Address]};

function DataKeyToXdr(dataKey?: DataKey): xdr.ScVal {
    if (!dataKey) {
        return xdr.ScVal.scvVoid();
    }
    let res: xdr.ScVal[] = [];
    switch (dataKey.tag) {
        case "Token":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Token"));
            break;
    case "NextStreamId":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("NextStreamId"));
            break;
    case "Streams":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Streams"));
            res.push(((i)=>xdr.ScVal.scvU32(i))(dataKey.values[0]));
            break;
    case "UserStreams":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("UserStreams"));
            res.push(((i)=>addressToScVal(i))(dataKey.values[0]));
            break;  
    }
    return xdr.ScVal.scvVec(res);
}

function DataKeyFromXdr(base64Xdr: string): DataKey {
    type Tag = DataKey["tag"];
    type Value = DataKey["values"];
    let [tag, values] = strToScVal(base64Xdr).vec()!.map(scValToJs) as [Tag, Value];
    if (!tag) {
        throw new Error('Missing enum tag when decoding DataKey from XDR');
    }
    return { tag, values } as DataKey;
}

export async function initialize<R extends ResponseTypes = undefined>({token, start_id}: {token: Address, start_id: u32}, options: {
  /**
   * The fee to pay for the transaction. Default: 100.
   */
  fee?: number
  /**
   * What type of response to return.
   *
   *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
   *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
   *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
   */
  responseType?: R
  /**
   * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
   */
  secondsToWait?: number
  /**
   * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
   *
   * ```ts
   * import freighter from "@stellar/freighter-api";
   *
   * // later, when calling this function:
   *   wallet: freighter,
   */
  wallet?: Wallet
} = {}) {
    return await invoke({
        method: 'initialize',
        args: [((i) => addressToScVal(i))(token),
        ((i) => xdr.ScVal.scvU32(i))(start_id)],
        ...options,
        parseResultXdr: () => {},
    });
}

export async function getStream<R extends ResponseTypes = undefined>({stream_id}: {stream_id: u32}, options: {
  /**
   * The fee to pay for the transaction. Default: 100.
   */
  fee?: number
  /**
   * What type of response to return.
   *
   *   - `undefined`, the default, parses the returned XDR as `Stream`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
   *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
   *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
   */
  responseType?: R
  /**
   * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
   */
  secondsToWait?: number
  /**
   * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
   *
   * ```ts
   * import freighter from "@stellar/freighter-api";
   *
   * // later, when calling this function:
   *   wallet: freighter,
   */
  wallet?: Wallet
} = {}) {
    return await invoke({
        method: 'get_stream',
        args: [((i) => xdr.ScVal.scvU32(i))(stream_id)],
        ...options,
        parseResultXdr: (xdr): Stream => {
            return StreamFromXdr(xdr);
        },
    });
}

export async function getStreamsByUser<R extends ResponseTypes = undefined>({caller}: {caller: Address}, options: {
  /**
   * The fee to pay for the transaction. Default: 100.
   */
  fee?: number
  /**
   * What type of response to return.
   *
   *   - `undefined`, the default, parses the returned XDR as `Array<Stream>`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
   *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
   *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
   */
  responseType?: R
  /**
   * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
   */
  secondsToWait?: number
  /**
   * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
   *
   * ```ts
   * import freighter from "@stellar/freighter-api";
   *
   * // later, when calling this function:
   *   wallet: freighter,
   */
  wallet?: Wallet
} = {}) {
    return await invoke({
        method: 'get_streams_by_user',
        args: [((i) => addressToScVal(i))(caller)],
        ...options,
        parseResultXdr: (xdr): Array<Stream> => {
            return scValStrToJs(xdr);
        },
    });
}

/**
 * Returns either the delta in seconds between `ledger.timestamp` and `startTime` or between `stopTime` and `startTime, whichever is smaller.
 * If `block.timestamp` is before `startTime`, it returns 0.
 * Panics if the id does not point to a valid stream.
 */
export async function deltaOf<R extends ResponseTypes = undefined>({stream_id}: {stream_id: u32}, options: {
  /**
   * The fee to pay for the transaction. Default: 100.
   */
  fee?: number
  /**
   * What type of response to return.
   *
   *   - `undefined`, the default, parses the returned XDR as `u64`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
   *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
   *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
   */
  responseType?: R
  /**
   * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
   */
  secondsToWait?: number
  /**
   * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
   *
   * ```ts
   * import freighter from "@stellar/freighter-api";
   *
   * // later, when calling this function:
   *   wallet: freighter,
   */
  wallet?: Wallet
} = {}) {
    return await invoke({
        method: 'delta_of',
        args: [((i) => xdr.ScVal.scvU32(i))(stream_id)],
        ...options,
        parseResultXdr: (xdr): u64 => {
            return scValStrToJs(xdr);
        },
    });
}

/**
 * Returns the amount of tokens that have already been released to the recipient.
 * Panics if the id does not point to a valid stream.
 * @param stream_id The id of the stream
 * @param who The address of the caller
 * @return The amount of tokens that have already been released
 */
export async function balanceOf<R extends ResponseTypes = undefined>({stream_id, caller}: {stream_id: u32, caller: Address}, options: {
  /**
   * The fee to pay for the transaction. Default: 100.
   */
  fee?: number
  /**
   * What type of response to return.
   *
   *   - `undefined`, the default, parses the returned XDR as `i128`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
   *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
   *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
   */
  responseType?: R
  /**
   * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
   */
  secondsToWait?: number
  /**
   * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
   *
   * ```ts
   * import freighter from "@stellar/freighter-api";
   *
   * // later, when calling this function:
   *   wallet: freighter,
   */
  wallet?: Wallet
} = {}) {
    return await invoke({
        method: 'balance_of',
        args: [((i) => xdr.ScVal.scvU32(i))(stream_id),
        ((i) => addressToScVal(i))(caller)],
        ...options,
        parseResultXdr: (xdr): i128 => {
            return scValStrToJs(xdr);
        },
    });
}

export async function createStream<R extends ResponseTypes = undefined>({sender, recipient, amount, token_address, start_time, stop_time}: {sender: Address, recipient: Address, amount: i128, token_address: Address, start_time: u64, stop_time: u64}, options: {
  /**
   * The fee to pay for the transaction. Default: 100.
   */
  fee?: number
  /**
   * What type of response to return.
   *
   *   - `undefined`, the default, parses the returned XDR as `u32`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
   *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
   *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
   */
  responseType?: R
  /**
   * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
   */
  secondsToWait?: number
  /**
   * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
   *
   * ```ts
   * import freighter from "@stellar/freighter-api";
   *
   * // later, when calling this function:
   *   wallet: freighter,
   */
  wallet?: Wallet
} = {}) {
    return await invoke({
        method: 'create_stream',
        args: [((i) => addressToScVal(i))(sender),
        ((i) => addressToScVal(i))(recipient),
        ((i) => i128ToScVal(i))(amount),
        ((i) => addressToScVal(i))(token_address),
        ((i) => xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(start_time),
        ((i) => xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(stop_time)],
        ...options,
        parseResultXdr: (xdr): u32 => {
            return scValStrToJs(xdr);
        },
    });
}

export async function withdrawFromStream<R extends ResponseTypes = undefined>({recipient, stream_id, amount}: {recipient: Address, stream_id: u32, amount: i128}, options: {
  /**
   * The fee to pay for the transaction. Default: 100.
   */
  fee?: number
  /**
   * What type of response to return.
   *
   *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
   *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
   *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
   */
  responseType?: R
  /**
   * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
   */
  secondsToWait?: number
  /**
   * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
   *
   * ```ts
   * import freighter from "@stellar/freighter-api";
   *
   * // later, when calling this function:
   *   wallet: freighter,
   */
  wallet?: Wallet
} = {}) {
    return await invoke({
        method: 'withdraw_from_stream',
        args: [((i) => addressToScVal(i))(recipient),
        ((i) => xdr.ScVal.scvU32(i))(stream_id),
        ((i) => i128ToScVal(i))(amount)],
        ...options,
        parseResultXdr: () => {},
    });
}

/**
 * Cancels the stream and transfers the tokens back on a pro rata basis.
 * Throws if the id does not point to a valid stream.
 * Throws if the caller is not the sender or the recipient of the stream.
 * Throws if there is a token transfer failure.
 * @param stream_id The id of the stream to cancel.
 * @return bool true=success, otherwise false.
 */
export async function cancelStream<R extends ResponseTypes = undefined>({caller, stream_id}: {caller: Address, stream_id: u32}, options: {
  /**
   * The fee to pay for the transaction. Default: 100.
   */
  fee?: number
  /**
   * What type of response to return.
   *
   *   - `undefined`, the default, parses the returned XDR as `void`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
   *   - `'simulated'` will only simulate/preflight the transaction, even if it's a change/set method that requires auth/signing. Returns full preflight info.
   *   - `'full'` return the full RPC response, meaning either 1. the preflight info, if it's a view/read method that doesn't require auth/signing, or 2. the `sendTransaction` response, if there's a problem with sending the transaction or if you set `secondsToWait` to 0, or 3. the `getTransaction` response, if it's a change method with no `sendTransaction` errors and a positive `secondsToWait`.
   */
  responseType?: R
  /**
   * If the simulation shows that this invocation requires auth/signing, `invoke` will wait `secondsToWait` seconds for the transaction to complete before giving up and returning the incomplete {@link SorobanClient.SorobanRpc.GetTransactionResponse} results (or attempting to parse their probably-missing XDR with `parseResultXdr`, depending on `responseType`). Set this to `0` to skip waiting altogether, which will return you {@link SorobanClient.SorobanRpc.SendTransactionResponse} more quickly, before the transaction has time to be included in the ledger. Default: 10.
   */
  secondsToWait?: number
  /**
   * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
   *
   * ```ts
   * import freighter from "@stellar/freighter-api";
   *
   * // later, when calling this function:
   *   wallet: freighter,
   */
  wallet?: Wallet
} = {}) {
    return await invoke({
        method: 'cancel_stream',
        args: [((i) => addressToScVal(i))(caller),
        ((i) => xdr.ScVal.scvU32(i))(stream_id)],
        ...options,
        parseResultXdr: () => {},
    });
}

const Errors = [ 

]