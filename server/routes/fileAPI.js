const router = require('express').Router();
const multer = require('multer');
const { access } = require('fs/promises');
const crypto = require('crypto');

const { Keys } = require('../credentialManager');

const fileStore = new Map();

function store(filename, data){
	fileStore.set(filename, data);
}

function deleteFileStore(filename){
	fileStore.delete(filename);
}

const storage = multer.diskStorage({
	destination: (_, file, cb) => cb(null, 'uploads/'),
	filename: (req, file, cb) => {
		if (file.size >= 15 * 1024 * 1024){
			cb(new Error('File size more than 15mb'));
		}else{
			if (Keys.hasKey(req.body.key)){
				const filename = `poketab-${crypto.randomBytes(16).toString('hex')}`;
				store(filename, { filename: filename, key: req.body.key, ext: req.body.ext, uids: new Set([req.body.uid]) });
				cb(null, filename);
			}else{
				cb(new Error('Unauthorized'));
			}
		}
	},
});

const upload = multer({ 
	storage: storage,
	limits: { fileSize: 15 * 1024 * 1024 },
}); //name field name

router.post('/upload', upload.single('file'), (req, res) => {
	if (req.file){
		res.status(200).send({ success: true, downlink: req.file.filename });
		console.log('Temporary file stored.');
	}else{
		res.status(401).send({ error: 'Cannot upload' });
	}
});

router.get('/download/:id/:key', (req, res) => {
	if (Keys.hasKey(req.params.key)){
		access(`uploads/${req.params.id}`)
			.then(() => {
				res.sendFile(`uploads/${req.params.id}`, { root: __dirname + '/../..' });
			}).catch(err => {
				console.log(`${err}`);
				res.status(404).send({ error: 'File not found' });
			});
	}else{
		res.status(403).send({ error: 'Unauthorized to view files' });
	}
});

router.get('*', (req, res) => {
	//unknown route
	res.status(404).send({ error: 'Unknown route' });
});

module.exports = { router, store, fileStore, deleteFileStore };