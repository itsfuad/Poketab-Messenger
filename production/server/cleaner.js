import { existsSync, rm, readdir } from 'fs';
import { fileStore, deleteFileStore } from './routes/fileAPI.js';
import { keyStore } from './database/db.js';
export function markForDelete(userId, key, filename) {
    const file = fileStore.get(filename);
    if (file) {
        file.uids = file.uids != null ? file.uids.add(userId) : new Set();
        console.log(`${filename} recieved by ${userId} | ${file.uids.size} of ${keyStore.getKey(key).activeUsers} recieved`);
        if (keyStore.getKey(key).activeUsers == file.uids.size) {
            rm(`uploads/${filename}`, () => {
                deleteFileStore(filename);
                console.log(`${filename} deleted after relaying`);
            });
        }
    }
    else if (existsSync(`uploads/${filename}`)) {
        rm(`uploads/${filename}`, () => {
            console.log(`${filename} deleted as Key expired`);
        });
    }
}
export function deleteFile(filename) {
    if (fileStore.get(filename)) {
        rm(`uploads/${filename}`, () => {
            deleteFileStore(filename);
            console.log(`${filename} deleted as requested by user`);
        });
    }
}
export function cleanJunks() {
    try {
        readdir('uploads', (err, files) => {
            if (err)
                throw err;
            files.forEach(file => {
                if (!fileStore.has(file) && file != 'dummy.txt') {
                    rm(`uploads/${file}`, () => {
                        console.log(`${file} deleted as garbage file`);
                    });
                }
            });
        });
    }
    catch (err) {
        console.log(err);
    }
}
cleanJunks();
//# sourceMappingURL=cleaner.js.map