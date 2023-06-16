import { __dirname } from '../expressApp.js';
import { Router } from 'express';
import { access } from 'fs/promises';
import { createWriteStream, unlink } from 'fs';
import crypto from 'crypto';

import { keyStore } from '../database/db.js';
import { deleteFile } from '../cleaner.js';

import { fileSocket } from '../sockets.js';


export const fileStore = new Map<string, { filename: string; key: string; uids: Set<string> }>();
export const filePaths = new Map<string, boolean>();

export function store(messageId: string, data: { filename: string; key: string; uids: Set<string> }) {
	fileStore.set(messageId, data);
	filePaths.set(data.filename, true);
	console.log(`${data.filename} stored. messageID: ${messageId}`);
}

export function deleteFileStore(messageId: string) {
	const filename = fileStore.get(messageId)?.filename;
	if (filename) {
		filePaths.delete(filename);
	}
	fileStore.delete(messageId);
}


const fileSizeLimit = 1024 * 1024 * 20; // 10 MB


function handleFileUpload(req: any, res: any, next: Function) {

	// Check if the request is multipart/form-data
	if (!req.is('multipart/form-data')) {
		return res.status(400).json({ error: 'Invalid file upload request.' });
	}

	// Check if the file field exists
	if (!req.headers['content-type'].includes('multipart/form-data')) {
		return res.status(400).json({ error: 'No file uploaded.' });
	}

	// Validate other fields as needed
	if (!keyStore.hasKey(req.params.key)) {
		return res.status(403).json({ error: 'Unauthorized to upload files' });
	}

	//console.log(Keys[req.body.key].userCount);
	if (keyStore.getKey(req.params.key).activeUsers <= 1) {
		return res.status(403).json({ error: 'File upload blocked for single user' });
	}

	// Create a temporary file stream
	const filename = `poketab-${crypto.randomBytes(16).toString('hex')}`;
	const tempFilePath = `${__dirname}/uploads/${filename}`
	const tempFileStream = createWriteStream(tempFilePath);

	// Store the size of uploaded data
	let uploadedDataSize = 0;

	// Handle data chunks
	req.on('data', (chunk: string | any[]) => {
		uploadedDataSize += chunk.length;

		// Check if the file size exceeds the limit
		if (uploadedDataSize > fileSizeLimit) {
			req.removeAllListeners('data'); // Stop receiving data

			console.log('File size exceeds the limit.');
			// Delete the temporary file
			unlink(tempFilePath, (err: any) => {
				if (err) {
					console.error('Error deleting temporary file:', err);
				} else {
					console.log('Temporary file deleted.');
				}
			});

			return res.status(413).json({ error: 'File size exceeds the limit.' });
		}

		// Write the chunk to the temporary file
		tempFileStream.write(chunk);
	});

	// Handle the end of the request
	req.on('end', () => {
		// Close the temporary file stream
		tempFileStream.end();

		console.log('File saved to temporary location.');

		// Store the new file name in the request object for further processing
		req.file = filename;

		// Continue to the next middleware or route handler
		next();
	});

	// Handle request abortion
	req.on('aborted', () => {

		tempFileStream.end();
		req.removeAllListeners('data'); // Stop receiving data

		console.log(`${filename} upload aborted`);
		fileSocket.to(req.params.key).emit('fileUploadError', req.params.messageId);

		// Delete the temporary file
		deleteFile(filename);
	});

	store(req.params.messageId, { filename: filename, key: req.params.key, uids: new Set([req.params.uid]) });
}




const router = Router();
export default router;

//Handle the upload of a file
router.post('/upload/:key/:messageId', handleFileUpload, (req, res) => {
	//If the file is present
	if (req.file) {
		//Send the file name as a response
		res.status(200).send({ success: true, downlink: req.file });
		console.log(`${req.file} recieved to be relayed`);
	} else {
		//Otherwise, send an error
		res.status(401).send({ error: 'Cannot upload' });
	}
});


router.get('/download/:id/:key', (req, res) => {
	console.log(`Download request for ${req.params.id} from ${req.params.key}`);
	if (keyStore.hasKey(req.params.key)) {
		access(`uploads/${req.params.id}`)
			.then(() => {
				res.sendFile(`uploads/${req.params.id}`, { root: process.cwd() });
			}).catch(err => {
				console.log(`${err}`);
				res.status(404).send({ error: 'File not found' });
			});
	} else {
		res.status(403).send({ error: 'Unauthorized to view files' });
	}
});

router.get('*', (req, res) => {
	//unknown route
	res.status(404).send({ error: 'Unknown route' });
});