import { readdir, rm } from 'fs/promises';
import { keys, fileStore, users } from './keys/_cred';
function deleteKeys() {
    for (let [key, value] of keys) {
        if (value.using != true && Date.now() - value.created > 120000) {
            keys.delete(key);
        }
    }
}
function deleteFiles() {
    readdir('uploads').then((files) => {
        files.map((file) => {
            if (!fileStore.has(file) && file != 'dummy.txt') {
                rm(`uploads/${file}`);
            }
            else if (fileStore.has(file) && !keys.has(fileStore.get(file).key)) {
                fileStore.delete(file);
            }
        });
    }).catch((err) => {
        console.log(err);
    });
}
function markForDelete(userId, key, filename) {
    let file = fileStore.get(filename);
    if (file) {
        file.uids = file.uids != null ? file.uids.add(userId) : new Set();
        if (users.getMaxUser(key) == file.uids.size) {
            console.log('Deleting file');
            rm(`uploads/${filename}`);
            fileStore.delete(filename);
        }
    }
}
function clean() {
    console.log('Running cleaner...');
    setInterval(deleteKeys, 1000);
    setInterval(deleteFiles, 2000);
}
module.exports = { markForDelete, clean };
//# sourceMappingURL=_worker.js.map