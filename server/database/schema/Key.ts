import { User } from "./User";

export class Key{
	users: {[key: string]: User};
	userCount: number = 0;
	maxUser: number = 2;
	admin: string | null;
	created: number = Date.now();
	keyName: string;
	constructor(key: string){
		this.keyName = key;
		this.users = {};
		this.admin = null;
		console.log('New key constructed');
	}

	__addUser(user: User){
		if (!this.users[user.uid]){
			if (this.userCount === this.maxUser){
				//console.log(`Key: ${this.key} is full`);
				return;
			}
			if (this.userCount === 0){
				this.admin = user.uid;
			}
			this.users[user.uid] = user;
			this.userCount++;
			//console.log(`User added to key: ${this.key}`);
		}
		//console.log(`User count: ${this.userCount} | Admin: ${this.admin} | Key: ${this.key} | Max User: ${this.maxUser}`);
	}

	removeUser(uid: string){
		delete this.users[uid];
		this.userCount > 0 ? this.userCount-- : this.userCount = 0;
		//console.log(`User removed from key: ${this.key}`);
		//console.log(`User count: ${this.userCount}`);
	}

	getUser(uid: string): User{
		return this.users[uid];
	}

	getUsers(): {[key: string]: User}{
		return this.users;
	}

	getUserList(): User[]{
		const users = Object.values(this.users);
		return users;
	}

	hasUser(uid: string): boolean{
		return this.users[uid] !== null;
	}

	isEmpty(): boolean{
		return this.userCount === 0;
	}

	getAvatarList(): string[]{
		const users = this.getUserList();
		const avatarArray = users.map((user) => user.avatar);
		return avatarArray;
	}
}

//module.exports = { Key };