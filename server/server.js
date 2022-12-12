const path = require('path');
const http = require('http');
const compression = require('compression');
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const crypto = require('crypto');
const socketIO = require('socket.io');

const { clean } = require('./cleaner');

//utility functions for the server
const { validateUserName, avList, isRealString, reactArray } = require('./utils/validation');
const { keyformat, makeid } = require('./utils/functions');
const { addKey, deleteKey, keys, uids, users } = require('./keys/cred');
const { markForDelete } = require('./cleaner');

//importing worker threads
//The worker threads module provides a way to create multiple environments running on separate threads that can communicate with each other via inter-thread messaging or sharing memory.
const { Worker } = require('worker_threads');

//import .env variables
require('dotenv').config();

//versioning and developer name
const version = process.env.npm_package_version || 'Development';
const developer = 'Fuad Hasan';
//admin password to view running chat numbers and create new chat keys
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

const devMode = false; //dev mode

//this blocks the client if they request 1000 requests in 15 minutes
const apiRequestLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minute
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests. Temporarily blocked from PokeTab server. Please try again later',
	standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

//public path to serve static files
const publicPath = path.join(__dirname, '../public');
//create the express app
const app = express();

const port = process.env.PORT || 3000;

clean();

const server = http.createServer(app);

//socketio server which can handle multiple connections and reconnects from the client
const io = socketIO(server);

//file socket handler is used to handle file transfers metadata but not the actual file transfer
const fileSocket = io.of('/file');
//handle the key generation request and authentication
const auth = io.of('/auth');

//disable x-powered-by header showing express in the response
app.disable('x-powered-by');

//view engine setup
app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'ejs'); //set the view engine to ejs [embedded javascript] to allow for dynamic html
app.set('trust proxy', 1);

//allow cross origin requests only from the client on poketab.live
app.use(cors());
app.use(compression()); //compress all responses
app.use(express.static(publicPath)); //serve static files from the public folder
app.use(express.json()); //parse json data
//parse url encoded data in the body of the request
app.use(express.urlencoded({ 
	extended: false
}));

app.use(apiRequestLimiter); //limit the number of requests to 100 in 15 minutes

// default route to serve the client
app.get('/', (_, res) => {
	const styleNonce = crypto.randomBytes(16).toString('hex');
	res.setHeader('Content-Security-Policy', `default-src 'self'; style-src 'nonce-${styleNonce}'; img-src 'self' data:;`);
	res.setHeader('Developer', 'Fuad Hasan');
	res.render('home', {title: 'Get Started', hash: styleNonce});
});

app.use('/api/files', require('./routes/fileAPI')); //route for file uploads
app.use('/api/download', require('./routes/fileAPI')); //route for file downloads

//route to send running chat numbers and create new chat keys to the admin
app.get('/admin/:pass', (req, res) => {
	if (req.params.pass === ADMIN_PASS) {
		console.log('Admin access granted');
		res.send(Object.fromEntries(keys));
	} else {
		res.setHeader('Developer', 'Fuad Hasan');
		res.setHeader('Content-Security-Policy', 'script-src \'none\'');
		res.render('errorRes', {title: 'Fuck off!', errorCode: '401', errorMessage: 'Unauthorized access', buttonText: 'Suicide'});
	}
});

app.get('/join', (_, res) => {
	res.setHeader('Content-Security-Policy', 'default-src \'self\'; img-src \'self\' data:;');
	res.setHeader('Developer', 'Fuad Hasan');
	res.render('join', {title: 'Join', version: `v.${version}`, key: null, key_label: 'Enter key <i id=\'lb__icon\' class="fa-solid fa-key"></i>'});
});

app.get('/join/:key', (req, res)=>{
	const key_format = /^[0-9a-zA-Z]{3}-[0-9a-zA-Z]{3}-[0-9a-zA-Z]{3}-[0-9a-zA-Z]{3}$/;
	if (key_format.test(req.params.key)){
		const scriptNonce = crypto.randomBytes(16).toString('hex');
		res.setHeader('Content-Security-Policy', `default-src 'self'; img-src 'self' data:; script-src 'self' 'nonce-${scriptNonce}';`);
		res.setHeader('Developer', 'Fuad Hasan');
		res.render('join', {title: 'Join', key_label: 'Checking <i id=\'lb__icon\' class="fa-solid fa-circle-notch fa-spin"></i>' , version: `v.${version}`, key: req.params.key, hash: scriptNonce});
	}
	else{
		res.redirect('/join');
	}
});

app.get('/create', (req, res) => {
	const key = makeid(12);
	const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null; //currently ip has nothing to do with our server. May be we can use it for user validation or attacts. 
	keys.set(key, {using: false, created: Date.now(), ip: ip});
	res.setHeader('Content-Security-Policy', 'default-src \'self\'; img-src \'self\' data:;');
	res.setHeader('Developer', 'Fuad Hasan');
	res.render('create', {title: 'Create', version: `v.${version}`, key: key});
});

app.get('/error', (_, res) => {
	res.setHeader('Content-Security-Policy', 'default-src \'self\';');
	res.setHeader('Developer', 'Fuad Hasan');
	res.render('errorRes', {title: 'Fuck off!', errorCode: '401', errorMessage: 'Unauthorized Access', buttonText: 'Suicide'});
});

app.get('/chat', (_, res) => {
	res.redirect('/join');
});

app.post('/chat', (req, res) => {

	const username = req.body.username;
	const key = req.body.key;
	const avatar = req.body.avatar;
	const maxuser = req.body.maxuser;

	if (!validateUserName(username)){
		res.setHeader('Developer', 'Fuad Hasan');
		res.setHeader('Content-Security-Policy', 'script-src \'none\'');
		res.status(400).send({
			error: 'Invalid username format. Please use only alphanumeric characters'
		});
	}
	if (!avList.includes(avatar)){
		res.setHeader('Developer', 'Fuad Hasan');
		res.setHeader('Content-Security-Policy', 'script-src \'none\'');
		res.status(400).send({
			error: 'Don\'t try to be oversmart. Choose avatar from the list'
		});
	}
	//get current users list on key
	if (keys.has(key) || devMode){
		const user = users.getUserList(key);
		const max_users = users.getMaxUser(key) ?? maxuser;
		//console.log(max_users);
		const uid = crypto.randomUUID();
		if (user.length >= max_users || max_users > 10){
			res.setHeader('Developer', 'Fuad Hasan');
			res.setHeader('Content-Security-Policy', 'script-src \'none\'');
			res.render('errorRes', {title: 'Fuck off!', errorCode: '401', errorMessage: 'Unauthorized access', buttonText: 'Suicide'});
		}else{
			res.setHeader('Developer', 'Fuad Hasan');
			res.setHeader('Content-Security-Policy', 'default-src \'self\'; img-src \'self\' data: blob:; style-src \'self\' \'unsafe-inline\'; connect-src \'self\' blob:;');
			res.setHeader('Cluster', `ID: ${process.pid}`);
			res.render('chat', {myName: username, myKey: key, myId: uid, myAvatar: avatar, maxUser: max_users, version: `${version}`, developer: developer});
		}
	}else{
		//send invalid key message
		res.setHeader('Developer', 'Fuad Hasan');
		res.setHeader('Content-Security-Policy', 'script-src \'none\'');
		res.render('errorRes', {title: 'Not found', errorCode: '404', errorMessage: 'Key session not found', buttonText: 'Renew'});
	}
});

app.get('/offline', (_, res) => {
	res.setHeader('Developer', 'Fuad Hasan');
	res.setHeader('Content-Security-Policy', 'script-src \'none\'');
	res.render('errorRes', {title: 'Offline', errorCode: 'Oops!', errorMessage: 'You are offline :(', buttonText: 'Refresh'});
});

app.get('*', (_, res) => {
	res.setHeader('Developer', 'Fuad Hasan');
	res.setHeader('Content-Security-Policy', 'script-src \'none\'');
	res.render('errorRes', {title: 'Page not found', errorCode: '404', errorMessage: 'Page not found', buttonText: 'Home'});
});





//socket.io connection
io.on('connection', (socket) => {
	socket.on('join', (params, callback) => {
		if (!isRealString(params.name) || !isRealString(params.key)) {
			return callback('empty');
		}
		if (params.avatar === undefined) {
			return callback('avatar');
		}
		const userList = users.getUserList(params.key);
		const user = userList.includes(params.name);
		if (user) {
			return callback('exists');
		}
		callback();
		keys.get(params.key) ? keys.get(params.key).using = true: addKey(params.key, {using: true, created: Date.now()});
		socket.join(params.key);
		users.removeUser(params.id);
		uids.set(socket.id, params.id);
		users.addUser(params.id, params.name, params.key, params.avatar, params.maxuser || users.getMaxUser(params.key));
		io.to(params.key).emit('updateUserList', users.getAllUsersDetails(params.key));
		const srvID = crypto.randomUUID();
		socket.emit('server_message', {color: 'limegreen', text: 'You joined the chat.🔥', id: srvID}, 'join');
		socket.broadcast.to(params.key).emit('server_message', {color: 'limegreen', text: `${params.name} joined the chat.🔥`, id: srvID}, 'join');
	});


	socket.on('message', (message, type, uId, reply, replyId, options, callback) => {
		const user = users.getUser(uids.get(socket.id));
		if (user && isRealString(message)) {
      
			const id = crypto.randomUUID();
      
			message.replaceAll('<', '&#60;');
			message.replaceAll('>', '&#62;');
			message.replaceAll('"', '&#34;');
			message.replaceAll('\'', '&#39;');
			message.replaceAll('&', '&#38;');
      
			if (type === 'text'){
				//create new Worker
				const worker = new Worker('./server/worker.js', {workerData: {message: message}});
				worker.on('message', (data) => {
					socket.broadcast.to(user.key).emit('newMessage', data, type, id, uId, reply, replyId, options);
					callback(id);
				});
			}else{
				socket.broadcast.to(user.key).emit('newMessage', message, type, id, uId, reply, replyId, options);
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
		const user = users.getUser(uids.get(socket.id));
		if (user){
			socket.broadcast.to(user.key).emit('seen', meta);
		}
	});


	socket.on('react', (target, messageId, myId) => {
		const user = users.getUser(uids.get(socket.id));
		if (user && reactArray.primary.includes(target) || reactArray.expanded.includes(target)) {
			io.to(user.key).emit('getReact', target, messageId, myId);
		}
	});


	socket.on('deletemessage', (messageId, msgUid, userName, userId) => {
		const user = users.getUser(uids.get(socket.id));
		if (user) {
			if (msgUid == userId){
				io.to(user.key).emit('deleteMessage', messageId, userName);
			}
		}
	});

	socket.on('createLocationMessage', (coord) => {
		const user = users.getUser(uids.get(socket.id));
		if (user) {
			const srvID = crypto.randomUUID();
			io.to(user.key).emit('server_message', {color: 'var(--secondary-dark);', coordinate: {longitude: coord.longitude, latitude: coord.latitude}, user: user.name, id: srvID}, 'location');
		}
	});


	socket.on('typing', () => {
		const user = users.getUser(uids.get(socket.id));
		if (user) {
			socket.broadcast.to(user.key).emit('typing', user.name, user.uid);
		}
	});
	socket.on('stoptyping', () => {
		const user = users.getUser(uids.get(socket.id));
		if (user) {
			socket.broadcast.to(user.key).emit('stoptyping', user.uid);
		}
	});


	socket.on('disconnect', () => {
		const user = users.removeUser(uids.get(socket.id));
		uids.delete(socket.id);
		if (user) {
			socket.broadcast.to(user.key).emit('updateUserList', users.getAllUsersDetails(user.key));
			const srvID = crypto.randomUUID();
			socket.broadcast.to(user.key).emit('server_message', {color: 'orangered', text: `${user.name} left the chat.🐸`, who: user.uid, id: srvID}, 'leave');
			console.log(`User ${user.name} disconnected from key ${user.key}`);
			const usercount = users.users.filter(datauser => datauser.key === user.key);
			if (usercount.length === 0) {
				users.removeMaxUser(user.key);
				//delete key from keys
				//keys.delete(user.key);
				deleteKey(user.key);
				console.log(`Session ended with key: ${user.key}`);
			}
			console.log(`${usercount.length == 0 ? 'No' : usercount.length} ${usercount.length > 1 ? 'users' : 'user'} left on ${user.key}`);
		}
	});
});


//file upload
fileSocket.on('connection', (socket) => {
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

});



auth.on('connection', (socket) => {
	socket.on('createRequest', (key, callback) => {
		if (!keyformat.test(key)){
			callback('Invalid key');
			return;
		}
		const keyExists = users.getUserList(key).length > 0;
		if (keyExists){
			socket.emit('createResponse', {exists: keyExists});
		}
		else{
			if (keys.has(key)) {
				if (keys.get(key).using == false){
					socket.emit('createResponse', {exists: keyExists});
				}
				else{
					callback('Key is already in use');
				}
			}
			else{
				callback('Expired or invalid key');
			}
		}
	});


	socket.on('joinRequest', (key, callback) => {
		if (!keyformat.test(key)){
			return;
		}
		const keyExists = users.getUserList(key).length > 0;
		if (keyExists){
			//check if max user is reached
			const user = users.getUserList(key);
			const max_users = users.getMaxUser(key) ?? 2;
			if (user.length >= max_users){
				callback('Not Authorized');
			}else{
				socket.emit('joinResponse', {exists: keyExists, userlist: users.getUserList(key), avatarlist: users.getAvatarList(key)});
			}
		}
		else{
			socket.emit('joinResponse', {exists: keyExists});
		}
	});
});





//fire up the server
server.listen(port, () => {
	console.log(`Server is up on port ${port} | ${devMode ? 'Development' : 'Production'} mode`);
});

module.exports = { server };
