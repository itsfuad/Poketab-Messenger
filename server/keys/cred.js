const { Users } = require('./../utils/users');
const fs = require('fs');

let users = new Users();
const keys = new Map();
const uids = new Map();
const fileStore = new Map();

//keys.set('admin', 'admin');
//keys.set('user', 'user');
function store(filename, data){
    fileStore.set(filename, data);
    //console.log(data["key"]);
    //append as json to file as file: data
    let json = fs.readFileSync('fileStore.json', 'utf8');
    if (json.length > 0) {
        json = JSON.parse(json);
        if (json[data["key"]] === undefined) {
            json[data["key"]] = [];
        }
        json[data["key"]].push(filename);
        fs.writeFileSync('fileStore.json', JSON.stringify(json));
    }else{
        fs.writeFileSync('fileStore.json', `{"${data["key"]}": ["${filename}"]}`);
    }
}

module.exports = {users, keys, uids, store, fileStore};