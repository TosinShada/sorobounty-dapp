import { xdr } from 'soroban-client';
import { Buffer } from "buffer";
import { scValStrToJs, scValToJs, addressToScVal, i128ToScVal, strToScVal } from './convert.js';
import { invoke } from './invoke.js';
export * from './constants.js';
export * from './server.js';
export * from './invoke.js';
;
;
export class Ok {
    value;
    constructor(value) {
        this.value = value;
    }
    unwrapErr() {
        throw new Error('No error');
    }
    unwrap() {
        return this.value;
    }
    isOk() {
        return true;
    }
    isErr() {
        return !this.isOk();
    }
}
export class Err {
    error;
    constructor(error) {
        this.error = error;
    }
    unwrapErr() {
        return this.error;
    }
    unwrap() {
        throw new Error(this.error.message);
    }
    isOk() {
        return false;
    }
    isErr() {
        return !this.isOk();
    }
}
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
const regex = /ContractError\((\d+)\)/;
function getError(err) {
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
        return new Err(Errors[i]);
    }
    return undefined;
}
function StreamToXdr(stream) {
    if (!stream) {
        return xdr.ScVal.scvVoid();
    }
    let arr = [
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("deposit"), val: ((i) => i128ToScVal(i))(stream["deposit"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("id"), val: ((i) => xdr.ScVal.scvU32(i))(stream["id"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("rate_per_second"), val: ((i) => xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(stream["rate_per_second"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("recipient"), val: ((i) => addressToScVal(i))(stream["recipient"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("remaining_balance"), val: ((i) => i128ToScVal(i))(stream["remaining_balance"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("sender"), val: ((i) => addressToScVal(i))(stream["sender"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("start_time"), val: ((i) => xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(stream["start_time"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("stop_time"), val: ((i) => xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(stream["stop_time"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("token_address"), val: ((i) => addressToScVal(i))(stream["token_address"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("token_decimals"), val: ((i) => xdr.ScVal.scvU32(i))(stream["token_decimals"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("token_symbol"), val: ((i) => xdr.ScVal.scvString(i))(stream["token_symbol"]) })
    ];
    return xdr.ScVal.scvMap(arr);
}
function StreamFromXdr(base64Xdr) {
    let scVal = strToScVal(base64Xdr);
    let obj = scVal.map().map(e => [e.key().str(), e.val()]);
    let map = new Map(obj);
    if (!obj) {
        throw new Error('Invalid XDR');
    }
    return {
        deposit: scValToJs(map.get("deposit")),
        id: scValToJs(map.get("id")),
        rate_per_second: scValToJs(map.get("rate_per_second")),
        recipient: scValToJs(map.get("recipient")),
        remaining_balance: scValToJs(map.get("remaining_balance")),
        sender: scValToJs(map.get("sender")),
        start_time: scValToJs(map.get("start_time")),
        stop_time: scValToJs(map.get("stop_time")),
        token_address: scValToJs(map.get("token_address")),
        token_decimals: scValToJs(map.get("token_decimals")),
        token_symbol: scValToJs(map.get("token_symbol"))
    };
}
function LocalBalanceToXdr(localBalance) {
    if (!localBalance) {
        return xdr.ScVal.scvVoid();
    }
    let arr = [
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("recipient_balance"), val: ((i) => i128ToScVal(i))(localBalance["recipient_balance"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("sender_balance"), val: ((i) => i128ToScVal(i))(localBalance["sender_balance"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("withdrawal_amount"), val: ((i) => i128ToScVal(i))(localBalance["withdrawal_amount"]) })
    ];
    return xdr.ScVal.scvMap(arr);
}
function LocalBalanceFromXdr(base64Xdr) {
    let scVal = strToScVal(base64Xdr);
    let obj = scVal.map().map(e => [e.key().str(), e.val()]);
    let map = new Map(obj);
    if (!obj) {
        throw new Error('Invalid XDR');
    }
    return {
        recipient_balance: scValToJs(map.get("recipient_balance")),
        sender_balance: scValToJs(map.get("sender_balance")),
        withdrawal_amount: scValToJs(map.get("withdrawal_amount"))
    };
}
function CreateStreamToXdr(createStream) {
    if (!createStream) {
        return xdr.ScVal.scvVoid();
    }
    let arr = [
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("duration"), val: ((i) => xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(createStream["duration"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("rate_per_second"), val: ((i) => xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(createStream["rate_per_second"]) })
    ];
    return xdr.ScVal.scvMap(arr);
}
function CreateStreamFromXdr(base64Xdr) {
    let scVal = strToScVal(base64Xdr);
    let obj = scVal.map().map(e => [e.key().str(), e.val()]);
    let map = new Map(obj);
    if (!obj) {
        throw new Error('Invalid XDR');
    }
    return {
        duration: scValToJs(map.get("duration")),
        rate_per_second: scValToJs(map.get("rate_per_second"))
    };
}
function DataKeyToXdr(dataKey) {
    if (!dataKey) {
        return xdr.ScVal.scvVoid();
    }
    let res = [];
    switch (dataKey.tag) {
        case "Token":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Token"));
            break;
        case "NextStreamId":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("NextStreamId"));
            break;
        case "Streams":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Streams"));
            res.push(((i) => xdr.ScVal.scvU32(i))(dataKey.values[0]));
            break;
        case "UserStreams":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("UserStreams"));
            res.push(((i) => addressToScVal(i))(dataKey.values[0]));
            break;
    }
    return xdr.ScVal.scvVec(res);
}
function DataKeyFromXdr(base64Xdr) {
    let [tag, values] = strToScVal(base64Xdr).vec().map(scValToJs);
    if (!tag) {
        throw new Error('Missing enum tag when decoding DataKey from XDR');
    }
    return { tag, values };
}
export async function initialize({ token, start_id }, options = {}) {
    return await invoke({
        method: 'initialize',
        args: [((i) => addressToScVal(i))(token),
            ((i) => xdr.ScVal.scvU32(i))(start_id)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function getStream({ stream_id }, options = {}) {
    return await invoke({
        method: 'get_stream',
        args: [((i) => xdr.ScVal.scvU32(i))(stream_id)],
        ...options,
        parseResultXdr: (xdr) => {
            return StreamFromXdr(xdr);
        },
    });
}
export async function getStreamsByUser({ caller }, options = {}) {
    return await invoke({
        method: 'get_streams_by_user',
        args: [((i) => addressToScVal(i))(caller)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
/**
 * Returns either the delta in seconds between `ledger.timestamp` and `startTime` or between `stopTime` and `startTime, whichever is smaller.
 * If `block.timestamp` is before `startTime`, it returns 0.
 * Panics if the id does not point to a valid stream.
 */
export async function deltaOf({ stream_id }, options = {}) {
    return await invoke({
        method: 'delta_of',
        args: [((i) => xdr.ScVal.scvU32(i))(stream_id)],
        ...options,
        parseResultXdr: (xdr) => {
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
export async function balanceOf({ stream_id, caller }, options = {}) {
    return await invoke({
        method: 'balance_of',
        args: [((i) => xdr.ScVal.scvU32(i))(stream_id),
            ((i) => addressToScVal(i))(caller)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function createStream({ sender, recipient, amount, token_address, start_time, stop_time }, options = {}) {
    return await invoke({
        method: 'create_stream',
        args: [((i) => addressToScVal(i))(sender),
            ((i) => addressToScVal(i))(recipient),
            ((i) => i128ToScVal(i))(amount),
            ((i) => addressToScVal(i))(token_address),
            ((i) => xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(start_time),
            ((i) => xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(stop_time)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function withdrawFromStream({ recipient, stream_id, amount }, options = {}) {
    return await invoke({
        method: 'withdraw_from_stream',
        args: [((i) => addressToScVal(i))(recipient),
            ((i) => xdr.ScVal.scvU32(i))(stream_id),
            ((i) => i128ToScVal(i))(amount)],
        ...options,
        parseResultXdr: () => { },
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
export async function cancelStream({ caller, stream_id }, options = {}) {
    return await invoke({
        method: 'cancel_stream',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => xdr.ScVal.scvU32(i))(stream_id)],
        ...options,
        parseResultXdr: () => { },
    });
}
const Errors = [];
