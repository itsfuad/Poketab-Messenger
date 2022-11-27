const router = require('express').Router();
const multer = require('multer');
const { access } = require('fs/promises');
const uuid = require('uuid').v4;
const { store } = require('../keys/cred');


let storage = multer.diskStorage({
	destination: (_, file, cb) => cb(null, 'uploads/'),
	filename: (req, file, cb) => {
		if (file.size >= 15 * 1024 * 1024){
			cb(new Error('File size more than 15mb'));
		}else{
			const filename = `poketab-${uuid()}-${file.originalname}`;
			store(filename, { filename: filename, key: req.body.key, uids: new Set([req.body.uid]) });
			cb(null, filename);
		}
	},
});

let upload = multer({ 
	storage: storage,
	limits: { fileSize: 15 * 1024 * 1024 },
}).single('file'); //name field name

router.post('/', async (req, res) => {
	//validate
	//store
    
	upload(req, res, (err) => {
		if (err) {
			console.log('File cannot be stored:', err.message);
			//send error response
			res.status(400).send({error: err.message});
		} else {
			//fileStore[req.file.filename] = {filename: req.file.filename, downloaded: 0, key: req.body.key};
			res.status(200).send({ success: true, downlink: req.file.filename });
			console.log('Temporary file stored.');
		}
	});

});

router.get('/:id', (req, res) => {
	//console.log(req.params);
	//console.log(fileStore);
	access(`uploads/${req.params.id}`)
		.then(() => {
			res.sendFile(`uploads/${req.params.id}`, { root: __dirname + '/../..' });
		}).catch(err => {
			console.log(`${err}`);
			res.status(404).send({ error: 'File not found' });
		});
});

module.exports = router;