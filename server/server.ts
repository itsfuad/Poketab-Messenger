console.log('Initializing Server');

import crypto from 'crypto';

//utility functions for the server
import { validateUserName, validateAvatar, avList, validateKey } from './utils/validation.js';
import { generateUniqueId, makeUsernameandPasswordForDevelopment } from './utils/functions.js';
import { keyStore } from './database/db.js';

//import .env variables
import { config } from 'dotenv';

import { app, httpServer } from './expressApp.js';

import './websockets.js';
import './fileSocket.js';
import './preAuthSocket.js';

config();

//versioning and developer name
const version = process.env.npm_package_version || 'Development';

const DEVELOPER = 'Fuad Hasan';

//console.log(__dirname);

//console.log(publicPath);

const port = process.env.PORT || 3000;

const ENVIRONMENT = process.env.BUILD_MODE == 'DEVELOPMENT' ? 'DEVELOPMENT' : 'PRODUCTION';

const Icon = ENVIRONMENT == 'DEVELOPMENT' ? 'dev.png' : 'icon.png';

// default route to serve the client
// Home route
app.get('/', (_, res) => {
	// Generate a random nonce
	const nonce = crypto.randomBytes(16).toString('hex');
	// Set the Content-Security-Policy header
	res.setHeader('Content-Security-Policy', `default-src 'self'; style-src 'self' 'nonce-${nonce}' ; img-src 'self' data:;`);
	// Set the Developer header
	res.setHeader('Developer', DEVELOPER);
	// Render the home page
	res.render('home/home', {title: 'Get Started', hash: nonce, version: `v.${version}`,  icon: Icon});
});

import adminRouter from './routes/admin.js';
import fileRouter from './routes/fileAPI.js';

app.use('/admin', adminRouter); //route for admin panel

app.use('/api/files', fileRouter); //route for file uploads

app.get('/create', (req, res) => {
	const nonce = crypto.randomBytes(16).toString('hex');
	res.setHeader('Content-Security-Policy', `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'nonce-${nonce}';`);
	res.setHeader('Developer', DEVELOPER);
	res.render('login/newUser', {title: 'Create', avList: avList, key: null, version: `v.${version}`, hash: nonce, takenAvlists: null, icon: Icon});
});

app.get('/join/:key', (req, res) =>{
	if (validateKey(req.params.key)){
		if (keyStore.hasKey(req.params.key)){

			//if key is full, redirect to join page
			if (keyStore.getKey(req.params.key).isFull()){
				blockNewChatRequest(res, {title: 'Unauthorized', errorCode: '401', errorMessage: 'Access denied', buttonText: 'Back', icon: 'block.png'});
				return;
			}
			const takenAvlists = keyStore.getUserList(req.params.key).map((user) => user.avatar);
			const nonce = crypto.randomBytes(16).toString('hex');
			res.setHeader('Content-Security-Policy', `default-src 'self'; img-src 'self' data:; style-src 'unsafe-inline' 'self'; script-src 'self' 'nonce-${nonce}';`);
			res.setHeader('Developer', DEVELOPER);
			res.render('login/newUser', {title: 'Join', avList: avList, version: `v.${version}`, key: req.params.key, hash: nonce, takenAvlists: takenAvlists, icon: Icon});
			return;
		}else{
			blockNewChatRequest(res, {title: 'Doesn\'t exist', errorCode: '404', errorMessage: 'Key does not exist', buttonText: 'Back', icon: 'error.png'});
			return;
		}
	}
	else{
		blockNewChatRequest(res, {title: 'Invalid', errorCode: '400', errorMessage: 'Key is not Valid', buttonText: 'Back', icon: 'error.png'});
		return;
	}
});

app.get('/join', (_, res) => {
	const nonce = crypto.randomBytes(16).toString('hex');
	res.setHeader('Content-Security-Policy', `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'nonce-${nonce}';`);
	res.setHeader('Developer', DEVELOPER);
	res.render('login/newUser', {title: 'Join', avList: avList, version: `v.${version}`, key: null, hash: nonce, takenAvlists: null, icon: Icon});
});

app.get('/connect', (_, res) => {
	const uid = crypto.randomBytes(16).toString('hex');
	const key = generateUniqueId();

	res.send({uid: uid, key: key});
});

app.get('/~', (_, res) => {
	if (ENVIRONMENT != 'DEVELOPMENT'){
		res.redirect('/join');
	}else{
        const { username, avatar } = makeUsernameandPasswordForDevelopment('00-000-00');
		approveNewChatRequest(res, {username: username, key: '00-000-00', avatar: avatar, max_users: 10, icon: Icon});
	}
});

app.post('/~', (req, res) => {

	//get the Username and avatar from the pre-request
	const username = req.body.username;
	const avatar = req.body.avatar;
	//validate username and avatar
	const isValidUsername = validateUserName(username);
	//if username and avatars are not valid
	if (!isValidUsername || !validateAvatar(avatar)) {
		res.setHeader('Developer', DEVELOPER);
		res.setHeader('Content-Security-Policy', 'script-src \'none\'');
		res.status(400).send({
			error: 
				!isValidUsername ? 
					'Invalid username' 
					: 'Invalid avatar'
		});
	}

	//If no problem so far,

	//get the key from the request
	let key = req.body.key;

	//if key was not supplied that means the request was a create request.
	if (!key){
		//Create request
		console.log('No key found. Creating new key...');
		//generate a new key
		const newKey = generateUniqueId();

		const maxuser = req.body.maxuser;

		approveNewChatRequest(res, {username: username, key: newKey, avatar: avatar, max_users: maxuser, icon: Icon});

	}else if(key && keyStore.hasKey(key)) {
		//Key exists, so the request is a join request
		//console.log(`Existing Key found: ${key}!\nChecking permissions...`);
		//Check if the key has reached the maximum user limit
		if (keyStore.getKey(key).isFull()){
			//console.log(`Maximum user reached. User is blocked from key: ${key}`);
			blockNewChatRequest(res, {title: 'Unauthorized', errorCode: '401', errorMessage: 'Access denied', buttonText: 'Back', icon: 'block.png'});
			return;
		}else{
			//if user have room to enter the chat
			//console.log('User have permission to join this chat');
			//console.log(`Redirecting to old chat with key: ${key}`);

			const { maxUser } = keyStore.getKey(key);

			approveNewChatRequest(res, {username: username, key: key, avatar: avatar, max_users: maxUser, icon: Icon});
			return;
		}
	}else{
		//console.log('No session found for this request.');
		blockNewChatRequest(res, {title: 'Not found', errorCode: '498', errorMessage: 'Session Key not found', buttonText: 'Renew', icon: 'session.png'});
		return;
	}
});

function blockNewChatRequest(res: any, data: {title: string, errorCode: string, errorMessage: string, buttonText: string, icon: string}){
	res.setHeader('Developer', DEVELOPER);
	res.setHeader('Content-Security-Policy', 'script-src \'none\'');
	res.render('errors/errorRes', {title: data.title, errorCode: data.errorCode, errorMessage: data.errorMessage, buttonText: data.buttonText, icon: data.icon});
}

function approveNewChatRequest(res: any, data: {username: string, key: string, avatar: string, max_users: number, icon: string}){
	const nonce = crypto.randomBytes(16).toString('hex');
	const welcomeSticker = Math.floor(Math.random() * 9) + 1;

	const uid = crypto.randomBytes(16).toString('hex');

	res.setHeader('Developer', DEVELOPER);
	res.setHeader('Content-Security-Policy', 'default-src \'self\'; img-src \'self\' data: blob:; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; connect-src \'self\' blob:; media-src \'self\' blob:;');
	res.setHeader('Cluster', `ID: ${process.pid}`);
	res.render('chat/chat', {myName: data.username, myKey: data.key, myId: uid, myAvatar: data.avatar, maxUser: data.max_users, ENV: ENVIRONMENT, hash: nonce, welcomeSticker: welcomeSticker, icon: data.icon});
}

app.get('/offline', (_, res) => {
	res.setHeader('Developer', DEVELOPER);
	res.setHeader('Content-Security-Policy', 'script-src \'none\'');
	res.render('errors/errorRes', {title: 'Offline', errorCode: 'Oops!', errorMessage: 'You are offline :(', buttonText: 'Refresh', icon: 'offline.png'});
});

app.get('*', (_, res) => {
	res.setHeader('Developer', DEVELOPER);
	res.setHeader('Content-Security-Policy', 'script-src \'none\'');
	res.render('errors/errorRes', {title: 'Page not found', errorCode: '404', errorMessage: 'Page not found', buttonText: 'Home', icon: '404.png'});
});

//fire up the server
httpServer.listen(port, () => {
	console.log('%cBooting up the server...', 'color: yellow;');
	console.log(`Server is up on port ${port} | Process ID: ${process.pid} in ${ENVIRONMENT} mode`);
	const HOOK_API_KEY = process.env.HOOK_API_KEY;
	const CHAT_ID = process.env.CHAT_ID;
	if (ENVIRONMENT === 'PRODUCTION' && HOOK_API_KEY && CHAT_ID){
		fetch(`https://api.telegram.org/bot${HOOK_API_KEY}/sendMessage?chat_id=${CHAT_ID}&text=Server is up on port ${port} | Process ID: ${process.pid} in ${ENVIRONMENT} mode`, {method: 'GET'})
		.catch(err => console.log);
	}
});