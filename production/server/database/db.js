console.log('Database ready');
import { Key } from './schema/Key.js';
export const Keys = {};
class KeyStore {
    //returns true if key is in the Keys object
    hasKey(key) {
        return Keys[key] != undefined || Keys[key] != null;
    }
    getUserList(key) {
        return Keys[key].getUserList();
    }
    getKey(key) {
        return Keys[key];
    }
    setKey(key, value) {
        Keys[key] = value;
    }
    clearKey(key) {
        delete Keys[key];
    }
    addUser(key, user) {
        if (!Keys[key]) {
            console.log("Created new key");
            Keys[key] = new Key(key);
            Keys[key].maxUser = 2;
        }
        Keys[key].__addUser(user);
        console.log(`${user.username} joined key: ${key}`);
    }
}
;
export const keyStore = new KeyStore();
export const SocketIds = {};
//module.exports = { Keys, SocketIds };
//# sourceMappingURL=db.js.map