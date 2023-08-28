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
exports.isApprovedForAll = exports.recordExist = exports.record = exports.ttl = exports.resolver = exports.owner = exports.setApprovalForAll = exports.setTtl = exports.setResolver = exports.setSubnodeOwner = exports.setOwner = exports.setRecord = exports.initialize = exports.Err = exports.Ok = void 0;
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
function DataKeyToXdr(dataKey) {
    if (!dataKey) {
        return soroban_client_1.xdr.ScVal.scvVoid();
    }
    let res = [];
    switch (dataKey.tag) {
        case "Records":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("Records"));
            res.push(((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
        case "Operators":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("Operators"));
            res.push(((i) => (0, convert_js_1.addressToScVal)(i))(dataKey.values[0]));
            res.push(((i) => (0, convert_js_1.addressToScVal)(i))(dataKey.values[1]));
            break;
        case "Admin":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("Admin"));
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
async function initialize({ admin }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'initialize',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(admin)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.initialize = initialize;
async function setRecord({ caller, node, owner, resolver, ttl }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'set_record',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node),
            ((i) => (0, convert_js_1.addressToScVal)(i))(owner),
            ((i) => (0, convert_js_1.addressToScVal)(i))(resolver),
            ((i) => soroban_client_1.xdr.ScVal.scvU32(i))(ttl)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.setRecord = setRecord;
async function setOwner({ caller, node, owner }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'set_owner',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node),
            ((i) => (0, convert_js_1.addressToScVal)(i))(owner)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.setOwner = setOwner;
async function setSubnodeOwner({ caller, node, label, owner }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'set_subnode_owner',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(label),
            ((i) => (0, convert_js_1.addressToScVal)(i))(owner)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.setSubnodeOwner = setSubnodeOwner;
async function setResolver({ caller, node, resolver }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'set_resolver',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node),
            ((i) => (0, convert_js_1.addressToScVal)(i))(resolver)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.setResolver = setResolver;
async function setTtl({ caller, node, ttl }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'set_ttl',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node),
            ((i) => soroban_client_1.xdr.ScVal.scvU32(i))(ttl)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.setTtl = setTtl;
async function setApprovalForAll({ caller, operator, approved }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'set_approval_for_all',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => (0, convert_js_1.addressToScVal)(i))(operator),
            ((i) => soroban_client_1.xdr.ScVal.scvBool(i))(approved)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.setApprovalForAll = setApprovalForAll;
async function owner({ node }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'owner',
        args: [((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.owner = owner;
async function resolver({ node }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'resolver',
        args: [((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.resolver = resolver;
async function ttl({ node }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'ttl',
        args: [((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.ttl = ttl;
async function record({ node }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'record',
        args: [((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return RecordFromXdr(xdr);
        },
    });
}
exports.record = record;
async function recordExist({ node }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'record_exist',
        args: [((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.recordExist = recordExist;
async function isApprovedForAll({ operator, owner }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'is_approved_for_all',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(operator),
            ((i) => (0, convert_js_1.addressToScVal)(i))(owner)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.isApprovedForAll = isApprovedForAll;
function RecordToXdr(record) {
    if (!record) {
        return soroban_client_1.xdr.ScVal.scvVoid();
    }
    let arr = [
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("owner"), val: ((i) => (0, convert_js_1.addressToScVal)(i))(record["owner"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("resolver"), val: ((i) => (0, convert_js_1.addressToScVal)(i))(record["resolver"]) }),
        new soroban_client_1.xdr.ScMapEntry({ key: ((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("ttl"), val: ((i) => soroban_client_1.xdr.ScVal.scvU32(i))(record["ttl"]) })
    ];
    return soroban_client_1.xdr.ScVal.scvMap(arr);
}
function RecordFromXdr(base64Xdr) {
    let scVal = (0, convert_js_1.strToScVal)(base64Xdr);
    let obj = scVal.map().map(e => [e.key().str(), e.val()]);
    let map = new Map(obj);
    if (!obj) {
        throw new Error('Invalid XDR');
    }
    return {
        owner: (0, convert_js_1.scValToJs)(map.get("owner")),
        resolver: (0, convert_js_1.scValToJs)(map.get("resolver")),
        ttl: (0, convert_js_1.scValToJs)(map.get("ttl"))
    };
}
const Errors = [];
