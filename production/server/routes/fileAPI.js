import { Router } from 'express';
import multer from 'multer';
import { access } from 'fs/promises';
import crypto from 'crypto';
import { keyStore } from '../database/db.js';
import { deleteFile } from '../cleaner.js';
import { fileSocket } from '../sockets.js';
export const fileStore = new Map();
export const filePaths = new Map();
export function store(messageId, data) {
    fileStore.set(messageId, data);
    filePaths.set(data.filename, true);
    console.log(`${data.filename} stored`);
}
export function deleteFileStore(messageId) {
    const filename = fileStore.get(messageId)?.filename;
    if (filename) {
        filePaths.delete(filename);
    }
    fileStore.delete(messageId);
}
const storage = multer.diskStorage({
    destination: (_, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        if (file.size >= 20 * 1024 * 1024) {
            cb(new Error('File size more than 20mb'), '');
            return;
        }
        if (!keyStore.hasKey(req.body.key)) {
            cb(new Error('Unauthorized'), '');
        }
        //console.log(Keys[req.body.key].userCount);
        if (keyStore.getKey(req.body.key).activeUsers <= 1) {
            cb(new Error('File upload blocked for single user'), '');
        }
        const filename = `poketab-${crypto.randomBytes(16).toString('hex')}`;
        req.on('aborted', () => {
            //close the connection
            console.log(`${file.mimetype} upload aborted`);
            fileSocket.to(req.body.key).emit('fileUploadError', req.body.messageId, file.mimetype.includes('image') ? 'image' : 'file');
            deleteFile(filename);
        });
        store(req.body.messageId, { filename: filename, key: req.body.key, ext: req.body.ext, uids: new Set([req.body.uid]) });
        cb(null, filename);
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }
}); //name field name
const router = Router();
export default router;
//Handle the upload of a file
router.post('/upload', upload.single('file'), (req, res) => {
    //If the file is present
    if (req.file) {
        //Send the file name as a response
        res.status(200).send({ success: true, downlink: req.file.filename });
        console.log(`${req.file.filename} recieved to be relayed`);
    }
    else {
        //Otherwise, send an error
        res.status(401).send({ error: 'Cannot upload' });
    }
});
router.get('/download/:id/:key', (req, res) => {
    if (keyStore.hasKey(req.params.key)) {
        access(`uploads/${req.params.id}`)
            .then(() => {
            res.sendFile(`uploads/${req.params.id}`, { root: process.cwd() });
        }).catch(err => {
            console.log(`${err}`);
            res.status(404).send({ error: 'File not found' });
        });
    }
    else {
        res.status(403).send({ error: 'Unauthorized to view files' });
    }
});
router.get('*', (req, res) => {
    //unknown route
    res.status(404).send({ error: 'Unknown route' });
});
//# sourceMappingURL=fileAPI.js.map