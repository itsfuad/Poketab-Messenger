import { User } from "./User.js";
export declare class Key {
    users: {
        [key: string]: User;
    };
    activeUsers: number;
    maxUser: number;
    admin: string | null;
    created: number;
    keyName: string;
    constructor(key: string);
    __addUser(user: User): void;
    removeUser(uid: string): void;
    getUser(uid: string): User;
    getUsers(): {
        [key: string]: User;
    };
    getUserList(): User[];
    hasUser(uid: string): boolean;
    isEmpty(): boolean;
    isFull(): boolean;
    getAvatarList(): string[];
}
