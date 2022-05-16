class Users {
    constructor () {
      this.users = [];
      this.MaxUser = new Map();
    }
    addUser (id, name, key, avatar, maxuser) {
      this.MaxUser.set(key, maxuser);
      //console.log(`Maxuser: ${maxuser}`);
      let user = {id, name, key, avatar};
      this.users.push(user);
      return user;
    }
    removeUser (id) {
      let user = this.getUser(id);
      if (user) {
        this.users = this.users.filter((user) => user.id !== id);
      }
      return user;
    }
    getUser (id) {
      return this.users.filter((user) => user.id === id)[0]
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
      let idArray = users.map((user) => user.id);
      return idArray;
    }
}
module.exports = {Users};
  
  