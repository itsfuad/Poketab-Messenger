const { Users } = require('./../utils/users');

let users = new Users();
const keys = new Map();

const uids = new Map();
const fileStore = new Map();

function store(filename, data){
    fileStore.set(filename, data);
}

function deleteFileStore(filename){
    console.log('Deleting file ' + filename);
    fileStore.delete(filename);
    console.log(fileStore);
}

function deleteKey(key){
    keys.delete(key);
}

function addKey(key, value){
    keys.set(key, value);
}

module.exports = {users, keys, deleteKey, addKey, uids, store, fileStore, deleteFileStore};