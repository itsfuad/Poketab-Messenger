import { io } from './websockets.js';
//file socket handler is used to handle file transfers metadata but not the actual file transfer
export const fileSocket = io.of('/file');
import crypto from 'crypto';
import { markForDelete } from './cleaner.js';

//file upload
fileSocket.on('connection', (socket) => {
	try{
		socket.on('join', (key) => {
			socket.join(key);
		});
	
		socket.on('fileUploadStart', ( type, thumbnail, uId, reply, replyId, options, metadata, key, callback) => {
			const id = crypto.randomUUID();
			socket.broadcast.to(key).emit('fileDownloadStart', type, thumbnail, id, uId, reply, replyId, options, metadata);
			callback(id);
		});
	
		socket.on('fileUploadEnd', (id, key, downlink) => {
			socket.broadcast.to(key).emit('fileDownloadReady', id, downlink);
			//socket.emit('fileSent', tempId, id, type, size);
		});
	
		socket.on('fileDownloaded', (userId, key, filename) => {
			markForDelete(userId, key, filename);
		});
	
		socket.on('fileUploadError', (key, id, type) => {
			socket.broadcast.to(key).emit('fileUploadError', id, type);
		});
	}catch(e){
		console.log(e);
	}
});