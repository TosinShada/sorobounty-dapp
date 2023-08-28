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
            res.push(((i) => xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
        case "Names":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Names"));
            res.push(((i) => xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
        case "Texts":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Texts"));
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
export async function initialize({ admin }, options = {}) {
    return await invoke({
        method: 'initialize',
        args: [((i) => addressToScVal(i))(admin)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function setRegistry({ caller, node, registry }, options = {}) {
    return await invoke({
        method: 'set_registry',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => xdr.ScVal.scvBytes(i))(node),
            ((i) => addressToScVal(i))(registry)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function setName({ caller, node, name }, options = {}) {
    return await invoke({
        method: 'set_name',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => xdr.ScVal.scvBytes(i))(node),
            ((i) => addressToScVal(i))(name)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function setText({ caller, node, text }, options = {}) {
    return await invoke({
        method: 'set_text',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => xdr.ScVal.scvBytes(i))(node),
            ((i) => xdr.ScVal.scvString(i))(text)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function remove({ caller, node }, options = {}) {
    return await invoke({
        method: 'remove',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function name({ node }, options = {}) {
    return await invoke({
        method: 'name',
        args: [((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function text({ node }, options = {}) {
    return await invoke({
        method: 'text',
        args: [((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function registry({ node }, options = {}) {
    return await invoke({
        method: 'registry',
        args: [((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
const Errors = [];
