const { unlink, readdir } = require('fs/promises');
const { existsSync } = require('fs');

const { fileStore, deleteFileStore } = require('./routes/fileAPI');
const { Keys } = require('./credentialManager');

function markForDelete(userId, key, filename){
	//{filename: req.file.filename, downloaded: 0, keys: [], uids: []}
	const file = fileStore.get(filename);
	if (file){
		file.uids = file.uids != null ? file.uids.add(userId) : new Set();
		//console.log(file);
		if (Keys[key].maxUser == file.uids.size) {
			console.log(`${filename} deleted as all users downloaded | Process ID: ${process.pid}`);
			//rm(`uploads/${filename}`);
			unlink(`uploads/${filename}`);
			deleteFileStore(filename);
		}
	}else if (existsSync(`uploads/${filename}`)){
		console.log(`${filename} deleted as Key expired | Process ID: ${process.pid}`);
		//rm(`uploads/${filename}`);
		unlink(`uploads/${filename}`);
	}
}

function cleanJunks(){
	console.log(`Cleaning junk files | Process ID: ${process.pid}`);
	readdir('uploads').then(files => {
		files.forEach(file => {
			if (file !== 'dummy.txt'){
				console.log(`${file} deleted as no longer in use | Process ID: ${process.pid}`);
				unlink(`uploads/${file}`);
			}
		});
	}).catch(err => {
		console.log(err);
	});
}

cleanJunks();

module.exports = { markForDelete, cleanJunks };