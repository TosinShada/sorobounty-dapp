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
        case "Records":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Records"));
            res.push(((i) => xdr.ScVal.scvBytes(i))(dataKey.values[0]));
            break;
        case "Operators":
            res.push(((i) => xdr.ScVal.scvSymbol(i))("Operators"));
            res.push(((i) => addressToScVal(i))(dataKey.values[0]));
            res.push(((i) => addressToScVal(i))(dataKey.values[1]));
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
export async function setRecord({ caller, node, owner, resolver, ttl }, options = {}) {
    return await invoke({
        method: 'set_record',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => xdr.ScVal.scvBytes(i))(node),
            ((i) => addressToScVal(i))(owner),
            ((i) => addressToScVal(i))(resolver),
            ((i) => xdr.ScVal.scvU32(i))(ttl)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function setOwner({ caller, node, owner }, options = {}) {
    return await invoke({
        method: 'set_owner',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => xdr.ScVal.scvBytes(i))(node),
            ((i) => addressToScVal(i))(owner)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function setSubnodeOwner({ caller, node, label, owner }, options = {}) {
    return await invoke({
        method: 'set_subnode_owner',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => xdr.ScVal.scvBytes(i))(node),
            ((i) => xdr.ScVal.scvBytes(i))(label),
            ((i) => addressToScVal(i))(owner)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function setResolver({ caller, node, resolver }, options = {}) {
    return await invoke({
        method: 'set_resolver',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => xdr.ScVal.scvBytes(i))(node),
            ((i) => addressToScVal(i))(resolver)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function setTtl({ caller, node, ttl }, options = {}) {
    return await invoke({
        method: 'set_ttl',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => xdr.ScVal.scvBytes(i))(node),
            ((i) => xdr.ScVal.scvU32(i))(ttl)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function setApprovalForAll({ caller, operator, approved }, options = {}) {
    return await invoke({
        method: 'set_approval_for_all',
        args: [((i) => addressToScVal(i))(caller),
            ((i) => addressToScVal(i))(operator),
            ((i) => xdr.ScVal.scvBool(i))(approved)],
        ...options,
        parseResultXdr: () => { },
    });
}
export async function owner({ node }, options = {}) {
    return await invoke({
        method: 'owner',
        args: [((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function resolver({ node }, options = {}) {
    return await invoke({
        method: 'resolver',
        args: [((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function ttl({ node }, options = {}) {
    return await invoke({
        method: 'ttl',
        args: [((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function record({ node }, options = {}) {
    return await invoke({
        method: 'record',
        args: [((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return RecordFromXdr(xdr);
        },
    });
}
export async function recordExist({ node }, options = {}) {
    return await invoke({
        method: 'record_exist',
        args: [((i) => xdr.ScVal.scvBytes(i))(node)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
export async function isApprovedForAll({ operator, owner }, options = {}) {
    return await invoke({
        method: 'is_approved_for_all',
        args: [((i) => addressToScVal(i))(operator),
            ((i) => addressToScVal(i))(owner)],
        ...options,
        parseResultXdr: (xdr) => {
            return scValStrToJs(xdr);
        },
    });
}
function RecordToXdr(record) {
    if (!record) {
        return xdr.ScVal.scvVoid();
    }
    let arr = [
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("owner"), val: ((i) => addressToScVal(i))(record["owner"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("resolver"), val: ((i) => addressToScVal(i))(record["resolver"]) }),
        new xdr.ScMapEntry({ key: ((i) => xdr.ScVal.scvSymbol(i))("ttl"), val: ((i) => xdr.ScVal.scvU32(i))(record["ttl"]) })
    ];
    return xdr.ScVal.scvMap(arr);
}
function RecordFromXdr(base64Xdr) {
    let scVal = strToScVal(base64Xdr);
    let obj = scVal.map().map(e => [e.key().str(), e.val()]);
    let map = new Map(obj);
    if (!obj) {
        throw new Error('Invalid XDR');
    }
    return {
        owner: scValToJs(map.get("owner")),
        resolver: scValToJs(map.get("resolver")),
        ttl: scValToJs(map.get("ttl"))
    };
}
const Errors = [];
