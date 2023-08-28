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

export type DataKey = {tag: "Registry", values: [Buffer]} | {tag: "Names", values: [Buffer]} | {tag: "Texts", values: [Buffer]} | {tag: "Admin", values: void};

function DataKeyToXdr(dataKey?: DataKey): xdr.ScVal {
    if (!dataKey) {
        return xdr.ScVal.scvVoid();
    }
    let res: xdr.ScVal[] = [];
    switch (dataKey.tag) {
        case "Registry":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Registry"));
            res.push(((i)=>xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
    case "Names":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Names"));
            res.push(((i)=>xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
    case "Texts":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Texts"));
            res.push(((i)=>xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
    case "Admin":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Admin"));
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

export async function initialize<R extends ResponseTypes = undefined>({admin}: {admin: Address}, options: {
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
        args: [((i) => addressToScVal(i))(admin)],
        ...options,
        parseResultXdr: () => {},
    });
}

export async function setRegistry<R extends ResponseTypes = undefined>({caller, node, registry}: {caller: Address, node: Buffer, registry: Address}, options: {
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
        method: 'set_registry',
        args: [((i) => addressToScVal(i))(caller),
        ((i) => xdr.ScVal.scvBytes(i))(node),
        ((i) => addressToScVal(i))(registry)],
        ...options,
        parseResultXdr: () => {},
    });
}

export async function setName<R extends ResponseTypes = undefined>({caller, node, name}: {caller: Address, node: Buffer, name: Address}, options: {
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
        method: 'set_name',
        args: [((i) => addressToScVal(i))(caller),
        ((i) => xdr.ScVal.scvBytes(i))(node),
        ((i) => addressToScVal(i))(name)],
        ...options,
        parseResultXdr: () => {},
    });
}

export async function setText<R extends ResponseTypes = undefined>({caller, node, text}: {caller: Address, node: Buffer, text: string}, options: {
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
        method: 'set_text',
        args: [((i) => addressToScVal(i))(caller),
        ((i) => xdr.ScVal.scvBytes(i))(node),
        ((i) => xdr.ScVal.scvString(i))(text)],
        ...options,
        parseResultXdr: () => {},
    });
}

export async function remove<R extends ResponseTypes = undefined>({caller, node}: {caller: Address, node: Buffer}, options: {
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
        method: 'remove',
        args: [((i) => addressToScVal(i))(caller),
        ((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: () => {},
    });
}

export async function name<R extends ResponseTypes = undefined>({node}: {node: Buffer}, options: {
  /**
   * The fee to pay for the transaction. Default: 100.
   */
  fee?: number
  /**
   * What type of response to return.
   *
   *   - `undefined`, the default, parses the returned XDR as `Address`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
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
        method: 'name',
        args: [((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr): Address => {
            return scValStrToJs(xdr);
        },
    });
}

export async function text<R extends ResponseTypes = undefined>({node}: {node: Buffer}, options: {
  /**
   * The fee to pay for the transaction. Default: 100.
   */
  fee?: number
  /**
   * What type of response to return.
   *
   *   - `undefined`, the default, parses the returned XDR as `Array<string>`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
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
        method: 'text',
        args: [((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr): Array<string> => {
            return scValStrToJs(xdr);
        },
    });
}

export async function registry<R extends ResponseTypes = undefined>({node}: {node: Buffer}, options: {
  /**
   * The fee to pay for the transaction. Default: 100.
   */
  fee?: number
  /**
   * What type of response to return.
   *
   *   - `undefined`, the default, parses the returned XDR as `Address`. Runs preflight, checks to see if auth/signing is required, and sends the transaction if so. If there's no error and `secondsToWait` is positive, awaits the finalized transaction.
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
        method: 'registry',
        args: [((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr): Address => {
            return scValStrToJs(xdr);
        },
    });
}

const Errors = [ 

]