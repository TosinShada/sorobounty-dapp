import { xdr } from 'soroban-client';
import { Buffer } from "buffer";
import { scValStrToJs, scValToJs, addressToScVal, strToScVal } from './convert.js';
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
function DataKeyToXdr(dataKey) {
    if (!dataKey) {
        return xdr.ScVal.scvVoid();
    }
    let res = [];
    switch (dataKey.tag) {
        case "Registry":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Registry"));
            break;
        case "BaseNode":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("BaseNode"));
            break;
        case "Controllers":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Controllers"));
            res.push(((i) => addressToScVal(i))(dataKey.values[0]));
            break;
        case "Owners":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Owners"));
            res.push(((i) => xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
        case "Expirations":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Expirations"));
            res.push(((i) => xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
        case "Admin":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Admin"));
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
export async function initialize({ registry, admin, base_node }, options = {}) {
    return await invoke({
        method: 'initialize',
        args: [((i) => addressToScVal(i))(registry),
            ((i) => addressToScVal(i))(admin),
            ((i) => xdr.ScVal.scvBytes(i))(base_node)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function addController({ caller, controller }, options = {}) {
    return await invoke({
        method: 'add_controller',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => addressToScVal(i))(controller)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function removeController({ caller, controller }, options = {}) {
    return await invoke({
        method: 'remove_controller',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => addressToScVal(i))(controller)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function transferContractOwnership({ caller, new_owner }, options = {}) {
    return await invoke({
        method: 'transfer_contract_ownership',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => addressToScVal(i))(new_owner)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function setResolver({ caller, resolver }, options = {}) {
    return await invoke({
        method: 'set_resolver',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => addressToScVal(i))(resolver)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function setRecord({ caller, owner, resolver, ttl }, options = {}) {
    return await invoke({
        method: 'set_record',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => addressToScVal(i))(owner),
            ((i) => addressToScVal(i))(resolver),
            ((i) => xdr.ScVal.scvU32(i))(ttl)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function nameExpiry({ name }, options = {}) {
    return await invoke({
        method: 'name_expiry',
        args: [((i) => xdr.ScVal.scvBytes(i))(name)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function nameOwner({ name }, options = {}) {
    return await invoke({
        method: 'name_owner',
        args: [((i) => xdr.ScVal.scvBytes(i))(name)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function available({ name }, options = {}) {
    return await invoke({
        method: 'available',
        args: [((i) => xdr.ScVal.scvBytes(i))(name)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function isController({ caller }, options = {}) {
    return await invoke({
        method: 'is_controller',
        args: [((i) => addressToScVal(i))(caller)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function register({ caller, owner, name, duration }, options = {}) {
    return await invoke({
        method: 'register',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => addressToScVal(i))(owner),
            ((i) => xdr.ScVal.scvBytes(i))(name),
            ((i) => xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(duration)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function renew({ caller, name, duration }, options = {}) {
    return await invoke({
        method: 'renew',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => xdr.ScVal.scvBytes(i))(name),
            ((i) => xdr.ScVal.scvU64(xdr.Uint64.fromString(i.toString())))(duration)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
const Errors = [];
