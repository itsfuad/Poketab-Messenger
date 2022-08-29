const fs = require('fs');
const { keys, users, fileStore } = require('./keys/cred');

function deleteKeys(){
    //console.log(keys);
    for (let [key, value] of keys){
        //console.dir(`${key} ${value.using}, ${value.created}, ${Date.now()}`);
        if (value.using != true && Date.now() - value.created > 120000){
        keys.delete(key);
        console.log(`Key ${key} deleted`);
        }
    }
}

function deleteFiles(){
    //read fileStore.json
    let json = fs.readFileSync('fileStore.json', 'utf8');
    if (json.length > 0) {
        let files = JSON.parse(json);
        for (let file in files){
        if (!keys.has(file)){
            //delete file
            files[file].forEach(function(filename){
            if (fs.existsSync('uploads/'+filename)){
                fs.unlinkSync('uploads/'+filename);
                //console.log(`File deleted for key ${file}`);
            }
            });
            //remove file from fileStore.json
            delete files[file];
            fs.writeFileSync('fileStore.json', JSON.stringify(files));
        }
        }
    }
}

function markForDelete(userId, key, filename){
    //{filename: req.file.filename, downloaded: 0, keys: [], uids: []}
    fileStore.get(filename).downloaded++;
    if (users.getMaxUser(key) == fileStore.get(filename).downloaded + 1) {
    console.log('Deleting file');
    fs.unlinkSync(`./uploads/${filename}`);
    fileStore.delete(filename);
    }
}

function clean(){
    console.log('Running cleaner...');
    setInterval(deleteKeys, 1000);
    setInterval(deleteFiles, 2000);
}

module.exports = { clean, markForDelete };
