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
exports.registry = exports.text = exports.name = exports.remove = exports.setText = exports.setName = exports.setRegistry = exports.initialize = exports.Err = exports.Ok = void 0;
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
        case "Registry":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("Registry"));
            res.push(((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
        case "Names":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("Names"));
            res.push(((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
        case "Texts":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("Texts"));
            res.push(((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(dataKey.values[0]));
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
async function setRegistry({ caller, node, registry }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'set_registry',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node),
            ((i) => (0, convert_js_1.addressToScVal)(i))(registry)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.setRegistry = setRegistry;
async function setName({ caller, node, name }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'set_name',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node),
            ((i) => (0, convert_js_1.addressToScVal)(i))(name)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.setName = setName;
async function setText({ caller, node, text }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'set_text',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node),
            ((i) => soroban_client_1.xdr.ScVal.scvString(i))(text)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.setText = setText;
async function remove({ caller, node }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'remove',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.remove = remove;
async function name({ node }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'name',
        args: [((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.name = name;
async function text({ node }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'text',
        args: [((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.text = text;
async function registry({ node }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'registry',
        args: [((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.registry = registry;
const Errors = [];
