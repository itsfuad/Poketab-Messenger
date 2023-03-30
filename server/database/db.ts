import { Key } from './schema/Key.js';
import { User } from './schema/User.js';

export const Keys: {[key: string]: Key} = {};

class KeyStore {
//returns true if key is in the Keys object
	hasKey(key: string): boolean{
		return Keys[key] != undefined || Keys[key] != null;
	}

	getUserList(key: string): User[]{
		return Keys[key].getUserList();
	}

	getKey(key: string): Key{
		return Keys[key];
	}

	setKey(key: string, value: Key): void{
		Keys[key] = value;
	}

	clearKey(key: string): void{
		delete Keys[key];
	}

	addUser(key: string, user: User, maxUser: number): void{
		if (!Keys[key]) {
			console.log("Created new key");
			Keys[key] = new Key(key);
			Keys[key].maxUser = maxUser;
		}
		Keys[key].__addUser(user);
		console.log(`${user.username} joined key: ${key}`);
	}
};

export const keyStore = new KeyStore();

export const SocketIds: {[key: string]: {[key: string]: string}} = {};