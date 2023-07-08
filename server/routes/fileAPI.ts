import { Router } from 'express';
import { access } from 'fs/promises';
import fs from 'fs';
import crypto from 'crypto';

import { keyStore } from '../database/db.js';

import { fileSocket } from '../sockets.js';

import { parse }  from './../utils/formParser.js';


export const fileStore = new Map<string, { filename: string; key: string; ext: string; uids: Set<string> }>();

export function store(messageId: string, data: { filename: string; key: string; ext: string; uids: Set<string> }) {
  fileStore.set(messageId, data);
  //console.log(`${data.filename} stored`);
}

export function deleteFileStore(messageId: string) {
  fileStore.delete(messageId);
  //console.log(`${messageId} deleted from fileStore`);
}

const router = Router();
export default router;


router.post('/upload/:key/:messageId/:userId', (req, res) => {

  if (!keyStore.hasKey(req.params.key)) {
    res.status(404).send({ error: 'Key not found' });
    return;
  }

  if(!keyStore.getKey(req.params.key).users[req.params.userId]){
    res.status(404).send({ error: 'User not found' });
    return;
  }

  const boundary = req.headers['content-type']?.split('; boundary=')[1];

  if (!boundary) {
    res.status(400).send({ error: 'Invalid form' });
    return;
  }

  //get the file size
  const fileSize = parseInt(req.headers['content-length'] as string);
  
  const maxFileSize = 1024 * 1024 * 100; //100MB

  if (fileSize > maxFileSize) {
    res.status(400).send({ error: 'File size too large' });
    return;
  }
  
  const chunks:Buffer[] = [];
  req.on('data', (chunk) => {
    chunks.push(chunk);
  });

  req.on('aborted', () => {
    req.destroy();
    console.log(`Upload aborted`);
    //console.log(chunks);
    chunks.length = 0;
    fileSocket.to(req.body.key).emit('fileUploadError', req.body.messageId);
  })

  req.on('end', () => {
    const data = Buffer.concat(chunks);

    const formData = parse(data, boundary);

    if (!formData) {
      res.status(400).send({ error: 'Invalid form' });
      return;
    }

    const file = formData[0];

    const filename = `${req.params.key}@${crypto.randomBytes(16).toString('hex')}`;

    fs.writeFile(`uploads/${filename}`, file.data, (err) => {
      if (err) {
        //console.log(err);
        res.status(500).send({ error: 'Internal server error' });
        return;
      }

      store(req.params.messageId, { filename, key: req.params.key, ext: file.type, uids: new Set([req.params.userId]) });
      res.status(200).send({ success: true, downlink: filename });
		  //console.log(`${filename} recieved to be relayed`);
    });
  });
});


router.get('/download/:key/:id/:userId', (req, res) => {

  //Todo: check if user is in key
  if(!keyStore.getKey(req.params.key).users[req.params.userId]){
    res.status(404).send({ error: 'User not found' });
    return;
  }

  access(`uploads/${req.params.id}`)
    .then(() => {
      res.sendFile(`uploads/${req.params.id}`, { root: process.cwd() });
    }).catch(err => {
      //console.log(`${err}`);
      res.status(404).send({ error: 'File not found' });
    });
});

router.get('*', (req, res) => {
  //unknown route
  res.status(404).send({ error: 'Unknown route' });
});