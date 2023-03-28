import { unlink, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { fileStore, deleteFileStore } from './routes/fileAPI.js';
import { keyStore } from './database/db.js';
export function markForDelete(userId, key, filename) {
    const file = fileStore.get(filename);
    if (file) {
        file.uids = file.uids != null ? file.uids.add(userId) : new Set();
        console.log(`${filename} recieved by ${userId} | ${file.uids.size} of ${keyStore.getKey(key).activeUsers} recieved`);
        if (keyStore.getKey(key).activeUsers == file.uids.size) {
            console.log(`${filename} deleted after relaying`);
            unlink(`uploads/${filename}`);
            deleteFileStore(filename);
        }
    }
    else if (existsSync(`uploads/${filename}`)) {
        console.log(`${filename} deleted as Key expired`);
        unlink(`uploads/${filename}`);
    }
}
export function cleanJunks() {
    readdir('uploads').then(files => {
        const filesToDelete = files.map(file => {
            if (file != 'dummy.txt') {
                return unlink(`uploads/${file}`);
            }
        });
        Promise.all(filesToDelete).then(() => {
            console.log('Cleaned all garbage files');
        }).catch(() => {
            console.log('Error while cleaning garbage files');
        });
        console.log(`Checking garbage files | Process ID: ${process.pid}`);
    }).catch(err => {
        console.log(err);
    });
}
cleanJunks();
//# sourceMappingURL=cleaner.js.map