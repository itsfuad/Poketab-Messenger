const { Users } = require('../utils/_users');

let users = new Users();
const keys = new Map<string, KeysObject>();
const uids = new Map<string, string>();
const fileStore = new Map<string, fileObject>();

export interface fileObject{
    filename: string, 
    key: string, 
    uids: Set<string>
}

export interface KeysObject{
    using: boolean, 
    created: number
}

function store(filename: string, data: fileObject){
    fileStore.set(filename, data);
}

module.exports = {store, users, keys, uids, fileStore};