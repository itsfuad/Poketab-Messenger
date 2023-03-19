import { keyStore } from '../database/db.js';
class idGenerator {
    constructor() {
        // private constructor to prevent creating new instances
    }
    static getInstance() {
        if (!idGenerator.instance) {
            idGenerator.instance = new idGenerator();
        }
        return idGenerator.instance;
    }
    makeid() {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < 7; i++) {
            // generate a random character from 0-9, A-Z, or a-z for xx-xxx-xx
            //use crypto.randomBytes instead of Math.random
            id += possible.charAt(Math.floor(Math.random() * possible.length));
            if (i === 1 || i === 4) {
                id += '-';
            }
        }
        if (keyStore.hasKey(id)) {
            // if id already exists, generate a new one
            return this.makeid();
        }
        return id;
    }
}
export const generateUniqueId = idGenerator.getInstance().makeid;
//# sourceMappingURL=functions.js.map