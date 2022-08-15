const { Users } = require('./../utils/users');

let users = new Users();
const keys = new Map();
const uids = new Map();
const fileStore = new Map();

module.exports = {users, keys, uids, fileStore};