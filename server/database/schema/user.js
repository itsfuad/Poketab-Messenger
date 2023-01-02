class User {
	constructor(username, uid, avatar, key){
		this.username = username;
		this.avatar = avatar;
		this.uid = uid;
		this.key = key;
	}
}

module.exports = { User };