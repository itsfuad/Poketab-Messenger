import { Key } from './schema/Key.js';
import { User } from './schema/User.js';
export declare const Keys: {
    [key: string]: Key;
};
declare class KeyStore {
    hasKey(key: string): boolean;
    getUserList(key: string): User[];
    getKey(key: string): Key;
    setKey(key: string, value: Key): void;
    clearKey(key: string): void;
    addUser(key: string, user: User, maxUser: number): void;
}
export declare const keyStore: KeyStore;
export declare const SocketIds: {
    [key: string]: {
        [key: string]: string;
    };
};
export {};
