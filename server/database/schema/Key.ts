import { User } from "./User.js";

export class Key{
	users: {[key: string]: User};
	activeUsers: number = 0;
	maxUser: number = 2;
	admin: string | null;
	created: number = Date.now();
	keyName: string;
	public constructor(key: string){
		this.keyName = key;
		this.users = {};
		this.admin = null;
	}

	__addUser(user: User){
		if (!this.users[user.uid]){
			if (this.activeUsers === this.maxUser){
				//console.log(`Key: ${this.key} is full`);
				return;
			}
			if (this.activeUsers === 0){
				this.admin = user.uid;
			}
			this.users[user.uid] = user;
			this.activeUsers++;
			//console.log(`User added to key: ${this.key}`);
		}
		//console.log(`User count: ${this.userCount} | Admin: ${this.admin} | Key: ${this.key} | Max User: ${this.maxUser}`);
	}

	removeUser(uid: string){
		delete this.users[uid];
		this.activeUsers > 0 ? this.activeUsers-- : this.activeUsers = 0;
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
		return this.activeUsers === 0;
	}

	isFull(): boolean{
		return this.activeUsers >= this.maxUser;
	}

	getAvatarList(): string[]{
		const users = this.getUserList();
		const avatarArray = users.map((user) => user.avatar);
		return avatarArray;
	}
}