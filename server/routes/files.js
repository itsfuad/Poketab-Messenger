const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const uuid = require('uuid').v4;
const { fileStore } = require('./../keys/cred');


let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const filename = file.originalname;
        cb(null, filename);
    }
});

let upload = multer({ 
    storage: storage,
    limits: { fileSize: 15000000 },
}).single('file'); //name field name

router.post('/', (req, res) => {
    //validate
    //store
    upload(req, res, async (err) => {
        if (err) {
            console.log(err);
            res.send({ error: err.message });
        } else {
            let fileId = uuid();
            fileStore.set(req.file.filename, {fileId: fileId, filename: req.file.filename, downloaded: 0, key: req.body.key});
            res.send({ success: true, downlink: `${req.file.filename}`, id: fileId });
        }
    });
});

router.get('/:id', (req, res) => {
    //console.log(req.params);
    //console.log(fileStore);
    if (fs.existsSync(`uploads/${req.params.id}`)) {
        res.sendFile(`uploads/${req.params.id}`, { root: __dirname + '/../..' });
    } else {
        res.send({ error: 'File not found' });
    }
});

module.exports = router;