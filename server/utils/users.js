class Users {
    constructor () {
      this.users = [];
      this.MaxUser = new Map();
    }
    addUser (uid, name, key, avatar, maxuser) {
      this.MaxUser.set(key, maxuser);
      //console.log(`Maxuser: ${maxuser}`);
      let user = {uid, name, key, avatar};
      this.users.push(user);
      return user;
    }
    removeUser (uid) {
      let user = this.getUser(uid);
      if (user) {
        this.users = this.users.filter((user) => user.uid !== uid);
      }
      return user;
    }
    getUser (uid) {
      return this.users.filter((user) => user.uid === uid)[0]
    }
    getUserList (key) {
      let users = this.users.filter((user) => user.key === key);
      let namesArray = users.map((user) => user.name);
      return namesArray;
    }
    getAllUsersDetails(key){
        let users = this.users.filter((user) => user.key === key);
        return users;
    }
    getAvatarList(key){
      let users = this.users.filter((user) => user.key === key);
      let avatarArray = users.map((user) => user.avatar);
      return avatarArray;
    }
    getMaxUser(key){
      return this.MaxUser.get(key);
    }
    removeMaxUser(key){
      this.MaxUser.delete(key);
    }
    getUserId(key){
      let users = this.users.filter((user) => user.key === key);
      let uidArray = users.map((user) => user.uid);
      return uidArray;
    }
}

module.exports = {Users};