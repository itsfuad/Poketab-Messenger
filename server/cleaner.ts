import { rm, readdir, existsSync } from 'fs';

import { fileStore, deleteFileStore, filePaths } from './routes/fileAPI.js';
import { keyStore } from './database/db.js';

export function markForDelete(userId: string, key: string, messageId: string){
	const file = fileStore.get(messageId);
	const filename = fileStore.get(messageId)?.filename;
	if (file){
		file.uids = file.uids != null ? file.uids.add(userId) : new Set();
		console.log(`${filename} recieved by ${userId} | ${file.uids.size} of ${keyStore.getKey(key).activeUsers} recieved`);
		if (keyStore.getKey(key).activeUsers == file.uids.size) {
			rm(`uploads/${filename}`, () =>{
				deleteFileStore(messageId);
				console.log(`${filename} deleted after relaying`);
			});
		}
	}else if (existsSync(`uploads/${filename}`)){
		rm(`uploads/${filename}`, () => {
			console.log(`${filename} deleted as Key expired`);
		});
	}
}

export function deleteFile(messageId: string){
	if (fileStore.get(messageId)){
		const fileName = fileStore.get(messageId)?.filename;

		rm(`uploads/${fileName}`, () => {
			deleteFileStore(messageId);
			console.log(`${fileName} deleted`);
		});
	}
}

export function cleanJunks(){
	try{
		readdir('uploads', (err, files) => {
			if (err) throw err;
			files.forEach(file => {
				if (!filePaths.get(file) && file != 'dummy.txt'){
					rm(`uploads/${file}`, () => {
						console.log(`${file} deleted as garbage file`);
					});
				}
			});
		});
	}catch(err){
		console.log(err);
	}
}

cleanJunks();