class Key{
	constructor(){
		this.users = {};
		this.userCount = 0;
		this.maxUser = 2;
		this.admin = null;
		this.created = Date.now();
		console.log('New key constructed');
	}

	addUser(user){
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
		}else{
			//console.log(`User already exists in key: ${this.key}`);	
		}
		//console.log(`User count: ${this.userCount} | Admin: ${this.admin} | Key: ${this.key} | Max User: ${this.maxUser}`);
	}

	removeUser(uid){
		delete this.users[uid];
		this.userCount > 0 ? this.userCount-- : this.userCount = 0;
		//console.log(`User removed from key: ${this.key}`);
		//console.log(`User count: ${this.userCount}`);
	}

	getUser(uid){
		return this.users[uid];
	}

	getUsers(){
		return this.users;
	}

	getUserList(){
		const users = Object.values(this.users);
		return users;
	}

	hasUser(uid){
		return this.users[uid] !== null;
	}

	isEmpty(){
		return this.userCount === 0;
	}

	getAvatarList(){
		const users = this.getUserList();
		const avatarArray = users.map((user) => user.avatar);
		return avatarArray;
	}
}

module.exports = { Key };