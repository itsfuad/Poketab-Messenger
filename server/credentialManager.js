const { Key } = require('./database/schema/Key');

const Keys = {};

const SocketIds = {};

//returns true if key is in the Keys object
Keys.hasKey = (key) => {
	return Keys[key] != undefined || Keys[key] != null;
};

Keys.getUserList = (key) => {
	return Keys[key].getUserList();
};

Keys.addUser = (key, user) => {
	if (!Keys[key]) {
		Keys[key] = new Key();
	}
	Keys[key].__addUser(user);
	console.log(`${user.username} joined key: ${key}`);
};

module.exports = { Keys, SocketIds };