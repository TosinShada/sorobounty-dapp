"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelStream = exports.withdrawFromStream = exports.createStream = exports.balanceOf = exports.deltaOf = exports.getStreamsByUser = exports.getStream = exports.initialize = exports.Err = exports.Ok = void 0;
const soroban_client_1 = require("soroban-client");
const buffer_1 = require("buffer");
const convert_js_1 = require("./convert.js");
const invoke_js_1 = require("./invoke.js");
__exportStar(require("./constants.js"), exports);
__exportStar(require("./server.js"), exports);
__exportStar(require("./invoke.js"), exports);
;
;
class Ok {
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
exports.Ok = Ok;
class Err {
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
exports.Err = Err;
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || buffer_1.Buffer;
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
        return soroban_client_1.xdr.ScVal.scvVoid();
    }
    let arr = [
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("deposit"), val: ((i) => (0, convert_js_1.i128ToScVal)(i))(stream["deposit"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("id"), val: ((i) => soroban_client_1.xdr.ScVal.scvU32(i))(stream["id"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("rate_per_second"), val: ((i) => soroban_client_1.xdr.ScVal.scvU64(soroban_client_1.xdr.Uint64.fromString(i.toString())))(stream["rate_per_second"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("recipient"), val: ((i) => (0, convert_js_1.addressToScVal)(i))(stream["recipient"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("remaining_balance"), val: ((i) => (0, convert_js_1.i128ToScVal)(i))(stream["remaining_balance"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("sender"), val: ((i) => (0, convert_js_1.addressToScVal)(i))(stream["sender"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("start_time"), val: ((i) => soroban_client_1.xdr.ScVal.scvU64(soroban_client_1.xdr.Uint64.fromString(i.toString())))(stream["start_time"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("stop_time"), val: ((i) => soroban_client_1.xdr.ScVal.scvU64(soroban_client_1.xdr.Uint64.fromString(i.toString())))(stream["stop_time"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("token_address"), val: ((i) => (0, convert_js_1.addressToScVal)(i))(stream["token_address"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("token_decimals"), val: ((i) => soroban_client_1.xdr.ScVal.scvU32(i))(stream["token_decimals"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("token_symbol"), val: ((i) => soroban_client_1.xdr.ScVal.scvString(i))(stream["token_symbol"]) })
    ];
    return soroban_client_1.xdr.ScVal.scvMap(arr);
}
function StreamFromXdr(base64Xdr) {
    let scVal = (0, convert_js_1.strToScVal)(base64Xdr);
    let obj = scVal.map().map(e => [e.key().str(), e.val()]);
    let map = new Map(obj);
    if (!obj) {
        throw new Error('Invalid XDR');
    }
    return {
        deposit: (0, convert_js_1.scValToJs)(map.get("deposit")),
        id: (0, convert_js_1.scValToJs)(map.get("id")),
        rate_per_second: (0, convert_js_1.scValToJs)(map.get("rate_per_second")),
        recipient: (0, convert_js_1.scValToJs)(map.get("recipient")),
        remaining_balance: (0, convert_js_1.scValToJs)(map.get("remaining_balance")),
        sender: (0, convert_js_1.scValToJs)(map.get("sender")),
        start_time: (0, convert_js_1.scValToJs)(map.get("start_time")),
        stop_time: (0, convert_js_1.scValToJs)(map.get("stop_time")),
        token_address: (0, convert_js_1.scValToJs)(map.get("token_address")),
        token_decimals: (0, convert_js_1.scValToJs)(map.get("token_decimals")),
        token_symbol: (0, convert_js_1.scValToJs)(map.get("token_symbol"))
    };
}
function LocalBalanceToXdr(localBalance) {
    if (!localBalance) {
        return soroban_client_1.xdr.ScVal.scvVoid();
    }
    let arr = [
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("recipient_balance"), val: ((i) => (0, convert_js_1.i128ToScVal)(i))(localBalance["recipient_balance"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("sender_balance"), val: ((i) => (0, convert_js_1.i128ToScVal)(i))(localBalance["sender_balance"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("withdrawal_amount"), val: ((i) => (0, convert_js_1.i128ToScVal)(i))(localBalance["withdrawal_amount"]) })
    ];
    return soroban_client_1.xdr.ScVal.scvMap(arr);
}
function LocalBalanceFromXdr(base64Xdr) {
    let scVal = (0, convert_js_1.strToScVal)(base64Xdr);
    let obj = scVal.map().map(e => [e.key().str(), e.val()]);
    let map = new Map(obj);
    if (!obj) {
        throw new Error('Invalid XDR');
    }
    return {
        recipient_balance: (0, convert_js_1.scValToJs)(map.get("recipient_balance")),
        sender_balance: (0, convert_js_1.scValToJs)(map.get("sender_balance")),
        withdrawal_amount: (0, convert_js_1.scValToJs)(map.get("withdrawal_amount"))
    };
}
function CreateStreamToXdr(createStream) {
    if (!createStream) {
        return soroban_client_1.xdr.ScVal.scvVoid();
    }
    let arr = [
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("duration"), val: ((i) => soroban_client_1.xdr.ScVal.scvU64(soroban_client_1.xdr.Uint64.fromString(i.toString())))(createStream["duration"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("rate_per_second"), val: ((i) => soroban_client_1.xdr.ScVal.scvU64(soroban_client_1.xdr.Uint64.fromString(i.toString())))(createStream["rate_per_second"]) })
    ];
    return soroban_client_1.xdr.ScVal.scvMap(arr);
}
function CreateStreamFromXdr(base64Xdr) {
    let scVal = (0, convert_js_1.strToScVal)(base64Xdr);
    let obj = scVal.map().map(e => [e.key().str(), e.val()]);
    let map = new Map(obj);
    if (!obj) {
        throw new Error('Invalid XDR');
    }
    return {
        duration: (0, convert_js_1.scValToJs)(map.get("duration")),
        rate_per_second: (0, convert_js_1.scValToJs)(map.get("rate_per_second"))
    };
}
function DataKeyToXdr(dataKey) {
    if (!dataKey) {
        return soroban_client_1.xdr.ScVal.scvVoid();
    }
    let res = [];
    switch (dataKey.tag) {
        case "Token":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("Token"));
            break;
        case "NextStreamId":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("NextStreamId"));
            break;
        case "Streams":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("Streams"));
            res.push(((i) => soroban_client_1.xdr.ScVal.scvU32(i))(dataKey.values[0]));
            break;
        case "UserStreams":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("UserStreams"));
            res.push(((i) => (0, convert_js_1.addressToScVal)(i))(dataKey.values[0]));
            break;
    }
    return soroban_client_1.xdr.ScVal.scvVec(res);
}
function DataKeyFromXdr(base64Xdr) {
    let [tag, values] = (0, convert_js_1.strToScVal)(base64Xdr).vec().map(convert_js_1.scValToJs);
    if (!tag) {
        throw new Error('Missing enum tag when decoding DataKey from XDR');
    }
    return { tag, values };
}
async function initialize({ token, start_id }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'initialize',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(token),
            ((i) => soroban_client_1.xdr.ScVal.scvU32(i))(start_id)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.initialize = initialize;
async function getStream({ stream_id }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'get_stream',
        args: [((i) => soroban_client_1.xdr.ScVal.scvU32(i))(stream_id)],
        ...options,
        parseResultXdr: (xdr) => {
            return StreamFromXdr(xdr);
        },
    });
}
exports.getStream = getStream;
async function getStreamsByUser({ caller }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'get_streams_by_user',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.getStreamsByUser = getStreamsByUser;
/**
 * Returns either the delta in seconds between `ledger.timestamp` and `startTime` or between `stopTime` and `startTime, whichever is smaller.
 * If `block.timestamp` is before `startTime`, it returns 0.
 * Panics if the id does not point to a valid stream.
 */
async function deltaOf({ stream_id }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'delta_of',
        args: [((i) => soroban_client_1.xdr.ScVal.scvU32(i))(stream_id)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.deltaOf = deltaOf;
/**
 * Returns the amount of tokens that have already been released to the recipient.
 * Panics if the id does not point to a valid stream.
 * @param stream_id The id of the stream
 * @param who The address of the caller
 * @return The amount of tokens that have already been released
 */
async function balanceOf({ stream_id, caller }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'balance_of',
        args: [((i) => soroban_client_1.xdr.ScVal.scvU32(i))(stream_id),
            ((i) => (0, convert_js_1.addressToScVal)(i))(caller)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.balanceOf = balanceOf;
async function createStream({ sender, recipient, amount, token_address, start_time, stop_time }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'create_stream',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(sender),
            ((i) => (0, convert_js_1.addressToScVal)(i))(recipient),
            ((i) => (0, convert_js_1.i128ToScVal)(i))(amount),
            ((i) => (0, convert_js_1.addressToScVal)(i))(token_address),
            ((i) => soroban_client_1.xdr.ScVal.scvU64(soroban_client_1.xdr.Uint64.fromString(i.toString())))(start_time),
            ((i) => soroban_client_1.xdr.ScVal.scvU64(soroban_client_1.xdr.Uint64.fromString(i.toString())))(stop_time)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.createStream = createStream;
async function withdrawFromStream({ recipient, stream_id, amount }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'withdraw_from_stream',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(recipient),
            ((i) => soroban_client_1.xdr.ScVal.scvU32(i))(stream_id),
            ((i) => (0, convert_js_1.i128ToScVal)(i))(amount)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.withdrawFromStream = withdrawFromStream;
/**
 * Cancels the stream and transfers the tokens back on a pro rata basis.
 * Throws if the id does not point to a valid stream.
 * Throws if the caller is not the sender or the recipient of the stream.
 * Throws if there is a token transfer failure.
 * @param stream_id The id of the stream to cancel.
 * @return bool true=success, otherwise false.
 */
async function cancelStream({ caller, stream_id }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'cancel_stream',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => soroban_client_1.xdr.ScVal.scvU32(i))(stream_id)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.cancelStream = cancelStream;
const Errors = [];
