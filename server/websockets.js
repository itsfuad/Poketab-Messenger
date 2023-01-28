//socketio server which can handle multiple connections and reconnects from the client
import { server } from './main.js';
import { Server } from 'socket.io';
//utility functions for the server
import { isRealString, reactArray } from './utils/validation.js';

import { Keys, SocketIds } from './database/db.js';
import { Key } from './database/schema/Key.js';

import { User } from './database/schema/User.js';

import crypto from 'crypto';

import { cleanJunks } from './cleaner.js';

import { Worker } from 'worker_threads';

export const io = new Server(server);

//socket.io connection
io.on('connection', (socket) => {
	try{
		socket.on('join', (params, callback) => {
			if (!isRealString(params.name) || !isRealString(params.key)) {
				return callback('Empty informations');
			}
			if (params.avatar === undefined) {
				return callback('Invalid Avatar');
			}
			if (Keys[params.key]?.userCount >= Keys[params.key]?.maxUser){
				return callback('Key is full.');
			}
			
			if (!Keys[params.key]){
				Keys[params.key] = new Key(params.key);
				Keys[params.key].maxUser = params.maxuser;
				console.log(`Key ${params.key} max user set to ${params.maxuser}`);
			}
			
			Keys.addUser(params.key, new User(params.name, params.id, params.avatar));

			console.log(`User ${params.name} joined key ${params.key} | ${Keys.getUserList(params.key).length} user(s) out of ${Keys[params.key].maxUser}`);

			const userList = Keys.getUserList(params.key);

			callback();
			
			socket.join(params.key);
	
			SocketIds[socket.id] = {uid: params.id, key: params.key};
			
			io.to(params.key).emit('updateUserList', userList);
			const srvID = crypto.randomUUID();
			socket.emit('server_message', {color: 'limegreen', text: 'You joined the chat.🔥', id: srvID}, 'join');
			socket.broadcast.to(params.key).emit('server_message', {color: 'limegreen', text: `${params.name} joined the chat.🔥`, id: srvID}, 'join');
		});
	
		socket.on('message', (message, type, uId, reply, replyId, options, callback) => {
			//const user = users.getUser(uids.get(socket.id));
	
			if (isRealString(message)) {
			
				const id = crypto.randomUUID();
			
				//console.log(`Message: ${message}`);

				if (type === 'text'){
					//create new Worker
					//TODO: use postMessage instead of workerData
					const worker = new Worker('./server/workers/messageParser.js', {workerData: { message: message }});
					worker.on('message', (data) => {
						socket.broadcast.to(SocketIds[socket.id].key).emit('newMessage', data, type, id, uId, reply, replyId, options);
						callback(id);
					});
				}else{
					socket.broadcast.to(SocketIds[socket.id].key).emit('newMessage', message, type, id, uId, reply, replyId, options);
					callback(id);
				}
			}
		});
		/*
	  socket.on('askForLinkPreview', (url, callback) => {
		console.log('URL requested: ', url);
		const worker = new Worker('./server/linkPreviewWorker.js', {workerData: {url: url}});
		worker.on('message', (data) => {
		  callback(data);
		});
	  });
	  */
	
		socket.on('seen', (meta) => {
			if (SocketIds[socket.id]){
				socket.broadcast.to(SocketIds[socket.id].key).emit('seen', meta);
			}
		});
	
		socket.on('react', (target, messageId, myId) => {
			if (SocketIds[socket.id]){
				if (reactArray.primary.includes(target) || reactArray.expanded.includes(target)) {
					io.to(SocketIds[socket.id].key).emit('getReact', target, messageId, myId);
				}
			}
		});
	
		socket.on('deletemessage', (messageId, msgUid, userName, userId) => {
			if (SocketIds[socket.id]){
				if (msgUid == userId){
					io.to(SocketIds[socket.id].key).emit('deleteMessage', messageId, userName);
				}
			}
		});
	
		socket.on('createLocationMessage', (coord) => {
			if (SocketIds[socket.id]){
				const srvID = crypto.randomUUID();
				io.to(SocketIds[socket.id].key).emit('server_message', {color: 'var(--secondary-dark);', coordinate: {longitude: coord.longitude, latitude: coord.latitude}, user: Keys[SocketIds[socket.id].key].getUser(SocketIds[socket.id].uid).username, id: srvID}, 'location');
			}
		});
	
		socket.on('typing', () => {
			if (SocketIds[socket.id]){
				const key = SocketIds[socket.id].key;
				const { username, uid } = Keys[key].getUser(SocketIds[socket.id].uid);
				socket.broadcast.to(key).emit('typing', username, uid);
			}
		});

		socket.on('stoptyping', () => {
			if (SocketIds[socket.id]){
				const key = SocketIds[socket.id].key;
				const { uid } = Keys[key].getUser(SocketIds[socket.id].uid);
				socket.broadcast.to(key).emit('stoptyping', uid);
			}
		});
		
		socket.on('disconnect', () => {
			//console.log('User disconnected');
			if (SocketIds[socket.id]){
				const key = SocketIds[socket.id].key;
		
				const user = Keys[key].getUser(SocketIds[socket.id].uid);
				console.log(`User ${user.username} disconnected from key ${key}`);
				
				Keys[key].removeUser(SocketIds[socket.id].uid);
				delete SocketIds[socket.id];
				socket.leave(key);

				const users = Keys[key].getUserList();
		
				socket.broadcast.to(key).emit('updateUserList', users);
				const srvID = crypto.randomUUID();
				socket.broadcast.to(key).emit('server_message', {color: 'orangered', text: `${user.username} left the chat.🐸`, who: user.uid, id: srvID}, 'leave');
				//console.log(`User ${user.username} disconnected from key ${user.key}`);
		
				const remainingUsers = Keys[key].userCount;
				
				console.log(`%c${remainingUsers == 0 ? 'No' : remainingUsers} ${remainingUsers > 1 ? 'users' : 'user'} left on ${key}`, 'color: orange');
		
				if (remainingUsers == 0) {
					delete Keys[key];
					cleanJunks();
					console.log(`%cSession ended with key: ${key}`, 'color: orange');
				}
			}
		});
	}catch(err){
		console.log(err);
	}
});

// Path: server/websockets.js
//module.exports = { io };