import crypto from 'crypto';
import { markForDelete } from './cleaner.js';
import { fileSocket } from './sockets.js';
//file upload
fileSocket.on('connection', (socket) => {
    try {
        socket.on('join', (key) => {
            socket.join(key);
        });
        socket.on('fileUploadStart', (type, thumbnail, uId, reply, replyId, options, metadata, key, callback) => {
            const id = crypto.randomUUID();
            socket.broadcast.to(key).emit('fileDownloadStart', type, thumbnail, id, uId, reply, replyId, options, metadata);
            callback(id);
        });
        socket.on('fileUploadEnd', (id, key, downlink) => {
            socket.broadcast.to(key).emit('fileDownloadReady', id, downlink);
            //socket.emit('fileSent', tempId, id, type, size);
        });
        socket.on('fileDownloaded', (userId, key, messageId) => {
            //console.log(`${userId} downloaded ${messageId}`);
            markForDelete(userId, key, messageId);
        });
        socket.on('fileUploadError', (key, id) => {
            socket.broadcast.to(key).emit('fileUploadError', id);
        });
    }
    catch (e) {
        console.log(e);
    }
});
//# sourceMappingURL=fileSocket.js.map