const { readdir, rm } = require('fs/promises');

const { keys, users, fileStore } = require('./keys/cred');

function deleteKeys(){
    for (let [key, value] of keys){
        if (value.using != true && Date.now() - value.created > 120000){
        keys.delete(key);
            //console.log(`Key ${key} deleted`);
        }
    }
}

function deleteFiles(){
    readdir('uploads').then(files => {
        files.map( file => {
            if (!fileStore.has(file) && file != 'dummy.txt'){
                //console.log('deleting file ' + file);
                rm(`uploads/${file}`);
            }else if (fileStore.has(file) && !keys.has(fileStore.get(file).key)){
                //console.log('Added to delete queue');
                fileStore.delete(file);
            }
        });
    }).catch(err => {
        console.log(err);
    });

}

function markForDelete(userId, key, filename){
    //{filename: req.file.filename, downloaded: 0, keys: [], uids: []}
    let file = fileStore.get(filename);
    if (file){
        file.uids = file.uids != null ? file.uids.add(userId) : new Set();
        //console.log(file);
        if (users.getMaxUser(key) == file.uids.size) {
            console.log('Deleting file');
            rm(`uploads/${filename}`);
            fileStore.delete(filename);
        }
    }
}

function clean(){
    console.log('Running cleaner...');
    setInterval(deleteKeys, 1000);
    setInterval(deleteFiles, 2000);
}


module.exports = { clean, markForDelete };
