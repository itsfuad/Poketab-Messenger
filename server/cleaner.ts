import { stat, rm, readdir, unlink, mkdir } from 'fs';

import { fileStore, deleteFileStore } from './routes/fileAPI.js';
import { keyStore } from './database/db.js';

export function markForDelete(userId: string, key: string, messageId: string) {

	const file = fileStore.get(messageId);
	const filename = fileStore.get(messageId)?.filename;

	if (file) {
		file.uids = file.uids != null ? file.uids.add(userId) : new Set();

		if (keyStore.getKey(key).activeUsers == file.uids.size) {
			stat(`uploads/${filename}`, (err, fileStats) => {
				if (err) {
					console.error(`Error getting file stats for ${filename}: ${err}`);
				} else {
					rm(`uploads/${filename}`, (err) => {
						if (err) {
							console.error(`Error deleting ${filename}: ${err}`);
						} else {
							deleteFileStore(messageId);
							console.log(`${filename} deleted after relaying`);
						}
					});
				}
			});
		}
	}
}


export function deleteFile(messageId: string) {
	if (fileStore.has(messageId)) {
		const fileName = fileStore.get(messageId)?.filename;
		rm(`uploads/${fileName}`, () => {
			deleteFileStore(messageId);
			console.log(`${fileName} deleted`);
		});
	}
}

export function cleanJunks(key?: string) {
	try {
		//remove upload folder
		stat('uploads', (err, stats) => {
			if (err) {
				console.log('Uploads folder not found');
				return;
			}
			readdir('uploads', (err, files) => {
				if (err) throw err;
				for (const file of files) {
	
					if (key) {
						if (file.startsWith(key)) {
							console.log(`Deleting ${file} as key ${key} expired`);
							unlink(`uploads/${file}`, err => {
								if (err) throw err;
							});
						}
					} else {
						console.log(`Deleting ${file} from uploads as Junk`);
	
						unlink(`uploads/${file}`, err => {
							if (err) throw err;
						});
					}
				}
			});
		});
	} catch (err) {
		console.log(err);
	}
}

cleanJunks();