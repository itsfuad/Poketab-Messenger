const { Users } = require('../utils/_users');
let users = new Users();
const keys = new Map();
const uids = new Map();
const fileStore = new Map();
function store(filename, data) {
    fileStore.set(filename, data);
}
module.exports = { store, users, keys, uids, fileStore };
export {};
//# sourceMappingURL=_cred.js.map