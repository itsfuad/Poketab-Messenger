export interface UserObject{
    uid: string, 
    name: string, 
    key: string, 
    avatar: string
}

export class Users {
    users = new Array<UserObject>;
    MaxUser = new Map<string, number>();
    constructor () {
      this.users = [];
      this.MaxUser = new Map();
    }
    addUser (uid: string, name: string, key: string, avatar: string, maxuser: number) {
      this.MaxUser.set(key, maxuser);
      //console.log(`Maxuser: ${maxuser}`);
      let user = {uid, name, key, avatar};
      this.users.push(user);
      return user;
    }
    removeUser (uid: string) {
      let user = this.getUser(uid);
      if (user) {
        this.users = this.users.filter((user) => user.uid !== uid);
      }
      return user;
    }
    getUser (uid: string) {
      return this.users.filter((user) => user.uid === uid)[0]
    }
    getUserList (key: string) {
      let users = this.users.filter((user) => user.key === key);
      let namesArray = users.map((user) => user.name);
      return namesArray;
    }
    getAllUsersDetails(key: string){
        let users = this.users.filter((user) => user.key === key);
        return users;
    }
    getAvatarList(key: string){
      let users = this.users.filter((user) => user.key === key);
      let avatarArray = users.map((user) => user.avatar);
      return avatarArray;
    }
    getMaxUser(key: string){
      return this.MaxUser.get(key);
    }
    removeMaxUser(key: string){
      this.MaxUser.delete(key);
    }
    getUserId(key: string){
      let users = this.users.filter((user) => user.key === key);
      let uidArray = users.map((user) => user.uid);
      return uidArray;
    }
}

module.exports = {Users};