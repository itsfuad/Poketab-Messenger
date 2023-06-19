import { Keys, keyStore } from '../database/db.js';
import { avList } from './validation.js';
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
//make random username
const usernameList = [
    'John',
    'Levi',
    'Armin',
    'Mikasa',
    'Erwin',
    'Jean',
    'Connie',
    'Sasha',
    'Hange',
    'Historia',
    'Ymir',
    'Annie',
    'Reiner',
    'Bertolt',
    'Zeke',
    'Pieck',
    'Porco',
    'Falco',
    'Gabi',
    'Kenny',
    'Rod',
    'Uri',
    'Frieda',
    'Grisha',
    'Carla',
    'Dina',
    'Faye',
    'Karl',
    'Yelena',
    'Onyankopon',
    'Nicolo',
];
export function makeUsernameandPasswordForDevelopment(key) {
    const username = usernameList[Math.floor(Math.random() * usernameList.length)];
    const avatar = avList[Math.floor(Math.random() * avList.length)];
    if (Keys[key]) {
        const existingNames = Keys[key].getUserList().map((user => user.username));
        const existingAvatars = Keys[key].getUserList().map((user => user.avatar));
        if (existingNames.includes(username) || existingAvatars.includes(avatar)) {
            return makeUsernameandPasswordForDevelopment(key);
        }
        else {
            return { username, avatar };
        }
    }
    else {
        return { username, avatar };
    }
}
export const generateUniqueId = idGenerator.getInstance().makeid;
//# sourceMappingURL=functions.js.map