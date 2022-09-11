const { Users } = require('./../utils/users');

let users = new Users();
const keys = new Map();
const uids = new Map();
const fileStore = new Map();

function store(filename, data){
    fileStore.set(filename, data);
}

module.exports = {users, keys, uids, store, fileStore};