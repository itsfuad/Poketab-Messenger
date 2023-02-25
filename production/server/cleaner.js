import { unlink, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { fileStore, deleteFileStore } from './routes/fileAPI.js';
import { keyStore } from './database/db.js';
export function markForDelete(userId, key, filename) {
    //{filename: req.file.filename, downloaded: 0, keys: [], uids: []}
    const file = fileStore.get(filename);
    if (file) {
        file.uids = file.uids != null ? file.uids.add(userId) : new Set();
        //console.log(file);
        if (keyStore.getKey(key).maxUser == file.uids.size) {
            console.log(`${filename} deleted as trunk | Process ID: ${process.pid}`);
            //rm(`uploads/${filename}`);
            unlink(`uploads/${filename}`);
            deleteFileStore(filename);
        }
    }
    else if (existsSync(`uploads/${filename}`)) {
        console.log(`${filename} deleted as Key expired | Process ID: ${process.pid}`);
        //rm(`uploads/${filename}`);
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
            console.log('Cleaned all junk files');
        }).catch(() => {
            console.log('Error while cleaning junk files');
        });
        console.log(`Cleaning junk files | Process ID: ${process.pid}`);
    }).catch(err => {
        console.log(err);
    });
}
cleanJunks();
//module.exports = { markForDelete, cleanJunks };
//# sourceMappingURL=cleaner.js.map