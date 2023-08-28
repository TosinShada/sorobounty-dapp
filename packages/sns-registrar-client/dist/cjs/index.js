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
exports.renew = exports.register = exports.isController = exports.available = exports.nameOwner = exports.nameExpiry = exports.setRecord = exports.setResolver = exports.transferContractOwnership = exports.removeController = exports.addController = exports.initialize = exports.Err = exports.Ok = void 0;
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
            break;
        case "BaseNode":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("BaseNode"));
            break;
        case "Controllers":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("Controllers"));
            res.push(((i) => (0, convert_js_1.addressToScVal)(i))(dataKey.values[0]));
            break;
        case "Owners":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("Owners"));
            res.push(((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
        case "Expirations":
            res.push(((i) => soroban_client_1.xdr.ScVal.scvSymbol(i))("Expirations"));
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
async function initialize({ registry, admin, base_node }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'initialize',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(registry),
            ((i) => (0, convert_js_1.addressToScVal)(i))(admin),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(base_node)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.initialize = initialize;
async function addController({ caller, controller }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'add_controller',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => (0, convert_js_1.addressToScVal)(i))(controller)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.addController = addController;
async function removeController({ caller, controller }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'remove_controller',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => (0, convert_js_1.addressToScVal)(i))(controller)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.removeController = removeController;
async function transferContractOwnership({ caller, new_owner }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'transfer_contract_ownership',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => (0, convert_js_1.addressToScVal)(i))(new_owner)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.transferContractOwnership = transferContractOwnership;
async function setResolver({ caller, resolver }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'set_resolver',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => (0, convert_js_1.addressToScVal)(i))(resolver)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.setResolver = setResolver;
async function setRecord({ caller, owner, resolver, ttl }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'set_record',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => (0, convert_js_1.addressToScVal)(i))(owner),
            ((i) => (0, convert_js_1.addressToScVal)(i))(resolver),
            ((i) => soroban_client_1.xdr.ScVal.scvU32(i))(ttl)],
        ...options,
        parseResultXdr: () => { },
    });
}
exports.setRecord = setRecord;
async function nameExpiry({ name }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'name_expiry',
        args: [((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(name)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.nameExpiry = nameExpiry;
async function nameOwner({ name }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'name_owner',
        args: [((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(name)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.nameOwner = nameOwner;
async function available({ name }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'available',
        args: [((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(name)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.available = available;
async function isController({ caller }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'is_controller',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.isController = isController;
async function register({ caller, owner, name, duration }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'register',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => (0, convert_js_1.addressToScVal)(i))(owner),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(name),
            ((i) => soroban_client_1.xdr.ScVal.scvU64(soroban_client_1.xdr.Uint64.fromString(i.toString())))(duration)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.register = register;
async function renew({ caller, name, duration }, options = {}) {
    return await (0, invoke_js_1.invoke)({
        method: 'renew',
        args: [((i) => (0, convert_js_1.addressToScVal)(i))(caller),
            ((i) => soroban_client_1.xdr.ScVal.scvBytes(i))(name),
            ((i) => soroban_client_1.xdr.ScVal.scvU64(soroban_client_1.xdr.Uint64.fromString(i.toString())))(duration)],
        ...options,
        parseResultXdr: (xdr) => {
            return (0, convert_js_1.scValStrToJs)(xdr);
        },
    });
}
exports.renew = renew;
const Errors = [];
