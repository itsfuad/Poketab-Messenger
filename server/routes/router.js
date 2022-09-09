const router = require('express').Router();
const multer = require('multer');
const { access } = require('fs/promises');
const uuid = require('uuid').v4;
const { store } = require('../keys/cred');


let storage = multer.diskStorage({
    destination: (_, file, cb) => cb(null, 'uploads/'),
    filename: (_, file, cb) => {
        const filename = `poketab-${uuid()}-${file.originalname}`;
        cb(null, filename);
    },
});

let upload = multer({ 
    storage: storage,
    limits: { fileSize: 15000000 },
}).single('file'); //name field name

router.post('/', (req, res) => {
    //validate
    //store
    upload(req, res, (err) => {
        if (err) {
            console.log('File cannot be stored:', err.message);
            res.send({ error: err.message });
        } else {
            store(req.file.filename, {filename: req.file.filename, key: req.body.key, uids: new Set([req.body.uid])});
            //fileStore[req.file.filename] = {filename: req.file.filename, downloaded: 0, key: req.body.key};
            res.send({ success: true, downlink: req.file.filename});
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
        console.log(`Error file access: ${err}`);
        res.status(404).send('Not found');
    });
});

module.exports = router;