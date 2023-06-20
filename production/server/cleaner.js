import { rm, readdir, unlink, mkdir, existsSync } from 'fs';
import { fileStore, deleteFileStore } from './routes/fileAPI.js';
import { keyStore } from './database/db.js';
export function markForDelete(userId, key, messageId) {
    const file = fileStore.get(messageId);
    const filename = fileStore.get(messageId)?.filename;
    if (file) {
        file.uids = file.uids != null ? file.uids.add(userId) : new Set();
        if (keyStore.getKey(key).activeUsers == file.uids.size) {
            if (existsSync(`uploads/${filename}`)) {
                rm(`uploads/${filename}`, (err) => {
                    if (err) {
                        console.error(`Error deleting ${filename}: ${err}`);
                    }
                    else {
                        deleteFileStore(messageId);
                        console.log(`${filename} deleted after relaying`);
                    }
                });
            }
        }
    }
}
export function deleteFile(messageId) {
    if (fileStore.has(messageId)) {
        const fileName = fileStore.get(messageId)?.filename;
        rm(`uploads/${fileName}`, () => {
            deleteFileStore(messageId);
            console.log(`${fileName} deleted`);
        });
    }
}
export function cleanJunks(key) {
    try {
        if (!existsSync('uploads')) {
            mkdir('uploads', err => {
                if (err)
                    throw err;
            });
            console.log('No uploads folder found, creating one');
            return;
        }
        readdir('uploads', (err, files) => {
            if (err)
                throw err;
            for (const file of files) {
                if (key) {
                    if (file.startsWith(key)) {
                        console.log(`Deleting ${file} as key ${key} expired`);
                        unlink(`uploads/${file}`, err => {
                            if (err)
                                throw err;
                        });
                    }
                }
                else {
                    console.log(`Deleting ${file} from uploads as Junk`);
                    unlink(`uploads/${file}`, err => {
                        if (err)
                            throw err;
                    });
                }
            }
        });
    }
    catch (err) {
        console.log(err);
    }
}
cleanJunks();
//# sourceMappingURL=cleaner.js.map