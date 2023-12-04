console.log('Initializing Server');

import crypto from 'node:crypto';
import rateLimit from 'npm:express-rate-limit';
import fs from 'node:fs';
import os from 'node:os';

import { blockedMessage } from './utils/blockedMessage.js';


//utility functions for the server
import { validateUserName, validateAvatar, avList, validateKey } from './utils/validation.js';
import { generateUniqueId, makeUsernameandPasswordForDevelopment } from './utils/functions.js';
import { keyStore } from './database/db.js';
//import { themeAccent } from './utils/themes.js';

import { themeAccent } from './../public/scripts/shared/Themes.js';

//import .env variables
import { config } from 'dotenv';

import { app, httpServer } from './expressApp.js';


import './chatSocket.js';
import './fileSocket.js';
import './preAuthSocket.js';

config();

//versioning and developer name
const version = process.env.npm_package_version || 'Development';

const DEVELOPER = 'Fuad Hasan';

//console.log(__dirname);

//console.log(publicPath);

const port = process.env.PORT || 52692;

const ENVIRONMENT = process.env.BUILD_MODE == 'DEVELOPMENT' ? 'DEVELOPMENT' : 'PRODUCTION';

const Icon = ENVIRONMENT == 'DEVELOPMENT' ? 'dev.png' : 'icon.png';

const accessURL = ENVIRONMENT == 'DEVELOPMENT' ? `http://localhost:${port}` : '';

import adminRouter from './routes/admin.js';
import fileRouter from './routes/fileAPI.js';
import { featureItemsData } from './utils/featureItemsData.js';


//this blocks the client if they request 100 requests in 5 minutes
const apiRequestLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minute
	max: 100, // limit each IP to 100 requests per windowMs
	message: blockedMessage,
	standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

app.use(apiRequestLimiter); //limit the number of requests to 100 in 15 minutes

app.use('/admin', adminRouter); //route for admin panel

app.use('/api/files', fileRouter); //route for file uploads

// default route to serve the client
// Home route
app.get('/', (req, res) => {
	// Generate a random nonce
	const nonce = crypto.randomBytes(16).toString('hex');
	// Set the Content-Security-Policy header
	res.setHeader('Content-Security-Policy', `default-src 'self'; style-src 'self' 'nonce-${nonce}' ; img-src 'self' data:; script-src 'self' 'nonce-${nonce}';`);
	// Set the Developer header
	res.setHeader('Developer', DEVELOPER);
	const cookie: string = req.cookies['theme'] || 'ocean';
	//if cookie in themeAccent
	const theme = themeAccent[cookie] ? cookie : 'ocean';
	const color = themeAccent[theme].secondary;
	//never expire cookie
	res.cookie('theme', theme, { maxAge: 2147483647, httpOnly: true });
	// Render the home page
	res.render('home/home', { title: 'Get Started', hash: nonce, version: `v.${version}`, icon: Icon, color: color, featureItems: featureItemsData});
});

app.get('/create', (req, res) => {
	const nonce = crypto.randomBytes(16).toString('hex');
	res.setHeader('Content-Security-Policy', `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'nonce-${nonce}';`);
	res.setHeader('Developer', DEVELOPER);
	const cookie: string = req.cookies['theme'] || 'ocean';
	//if cookie in themeAccent
	const theme = themeAccent[cookie] ? cookie : 'ocean';
	const color = themeAccent[theme].secondary;
	//never expire cookie
	res.cookie('theme', theme, { maxAge: 2147483647, httpOnly: true });
	res.render('login/newUser', { title: 'Create', avList: avList, key: null, version: `v.${version}`, hash: nonce, takenAvlists: null, icon: Icon , color: color});
});


app.get('/join/:key', (req, res) => {
	if (validateKey(req.params.key)) {
		if (keyStore.hasKey(req.params.key)) {

			//if key is full, redirect to join page
			if (keyStore.getKey(req.params.key).isFull()) {
				blockNewChatRequest(req, res, { title: 'Unauthorized', errorCode: '401', errorMessage: 'Access denied', buttonText: 'Back', icon: 'block.png' });
				return;
			}
			const takenAvlists = keyStore.getUserList(req.params.key).map((user) => user.avatar);
			const nonce = crypto.randomBytes(16).toString('hex');
			res.setHeader('Content-Security-Policy', `default-src 'self'; img-src 'self' data:; style-src 'unsafe-inline' 'self'; script-src 'self' 'nonce-${nonce}';`);
			res.setHeader('Developer', DEVELOPER);
			const cookie: string = req.cookies['theme'] || 'ocean';
			//if cookie in themeAccent
			const theme = themeAccent[cookie] ? cookie : 'ocean';
			const color = themeAccent[theme].secondary;
			//never expire cookie
			res.cookie('theme', theme, { maxAge: 2147483647, httpOnly: true });
			res.render('login/newUser', { title: 'Join', avList: avList, version: `v.${version}`, key: req.params.key, hash: nonce, takenAvlists: takenAvlists, icon: Icon , color: color});
			return;
		} else {
			blockNewChatRequest(req, res, { title: 'Doesn\'t exist', errorCode: '404', errorMessage: 'Key does not exist', buttonText: 'Back', icon: 'error.png' });
			return;
		}
	}
	else {
		blockNewChatRequest(req, res, { title: 'Invalid', errorCode: '400', errorMessage: 'Key is not Valid', buttonText: 'Back', icon: 'error.png' });
		return;
	}
});

app.get('/join', (req, res) => {
	const nonce = crypto.randomBytes(16).toString('hex');
	res.setHeader('Content-Security-Policy', `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'nonce-${nonce}';`);
	res.setHeader('Developer', DEVELOPER);
	const cookie: string = req.cookies['theme'] || 'ocean';
	//if cookie in themeAccent
	const theme = themeAccent[cookie] ? cookie : 'ocean';
	const color = themeAccent[theme].secondary;
	//never expire cookie
	res.cookie('theme', theme, { maxAge: 2147483647, httpOnly: true });
	res.render('login/newUser', { title: 'Join', avList: avList, version: `v.${version}`, key: null, hash: nonce, takenAvlists: null, icon: Icon , color: color});
});

app.put('/theme', (req, res) => {
	const referer = req.headers.referer;
	//if the request came from the same host then allow the request
	if (!referer){
		res.status(403).send({ error: 'No referer found' });
		return;
	}
	const theme = themeAccent[req.body.theme] ? req.body.theme : 'ocean';
	res.cookie('theme', theme, { maxAge: 2147483647, httpOnly: true });
	res.status(200).send({ message: 'Theme changed' });
});

app.get('/~', (req, res) => {
	if (ENVIRONMENT != 'DEVELOPMENT') {
		res.redirect('/join');
	} else {
		const { username, avatar } = makeUsernameandPasswordForDevelopment('00-000-00');

		approveNewChatRequest(req, res, { username: username, key: '00-000-00', avatar: avatar, max_users: 10, icon: Icon });
	}
});

app.post('/~', (req, res) => {
	const referar = req.headers.referer;
	//if the request came from the same host then allow the request
	console.log(referar);
	if (!referar){
		blockNewChatRequest(req, res, { title: 'No Referer', errorCode: '403', errorMessage: 'No referer found', buttonText: 'Back', icon: 'error.png' });
		return;
	}

	if (req.headers.host != referar.split('/')[2]) {	
		blockNewChatRequest(req, res, { title: 'Invalid Referer', errorCode: '403', errorMessage: 'Invalid referer', buttonText: 'Back', icon: 'error.png' });
		return;
	}

	//get username and avatar from the request
	const username = req.body.username;
	const avatar = req.body.avatar;
	//validate username and avatar
	const isValidUsername = validateUserName(username);
	//if username and avatars are not valid
	if (!isValidUsername || !validateAvatar(avatar)) {
		res.setHeader('Developer', DEVELOPER);
		res.setHeader('Content-Security-Policy', `script-src 'none'`);
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
	if (!key) {
		//Create request
		console.log('No key found. Creating new key...');
		//generate a new key
		const newKey = generateUniqueId();

		const maxuser = req.body.maxuser;

		approveNewChatRequest(req, res, { username: username, key: newKey, avatar: avatar, max_users: maxuser, icon: Icon });

	} else if (key && keyStore.hasKey(key)) {
		//Key exists, so the request is a join request
		//console.log(`Existing Key found: ${key}!\nChecking permissions...`);
		//Check if the key has reached the maximum user limit
		if (keyStore.getKey(key).isFull()) {
			//console.log(`Maximum user reached. User is blocked from key: ${key}`);
			blockNewChatRequest(req, res, { title: 'Unauthorized', errorCode: '401', errorMessage: 'Access denied', buttonText: 'Back', icon: 'block.png' });
			return;
		} else {
			//if user have room to enter the chat
			//console.log('User have permission to join this chat');
			//console.log(`Redirecting to old chat with key: ${key}`);

			const { maxUser } = keyStore.getKey(key);

			approveNewChatRequest(req, res, { username: username, key: key, avatar: avatar, max_users: maxUser, icon: Icon });
			return;
		}
	} else {
		//console.log('No session found for this request.');
		blockNewChatRequest(req, res, { title: 'Not found', errorCode: '498', errorMessage: 'Session Key not found', buttonText: 'Renew', icon: 'session.png' });
		return;
	}
});

function blockNewChatRequest(req: any, res: any, data: { title: string, errorCode: string, errorMessage: string, buttonText: string, icon: string }) {
	res.setHeader('Developer', DEVELOPER);
	res.setHeader('Content-Security-Policy', `script-src 'self'`);

	const cookie: string = req.cookies['theme'] || 'ocean';
	//if cookie in themeAccent
	const theme = themeAccent[cookie] ? cookie : 'ocean';
	const color = themeAccent[theme].secondary;
	//never expire cookie
	res.cookie('theme', theme, { maxAge: 2147483647, httpOnly: true });

	res.render('errors/errorRes', { title: data.title, errorCode: data.errorCode, errorMessage: data.errorMessage, buttonText: data.buttonText, icon: data.icon, color: color });
}

function approveNewChatRequest(req: any, res: any, data: { username: string, key: string, avatar: string, max_users: number, icon: string}) {
	const nonce = crypto.randomBytes(16).toString('hex');
	const welcomeSticker = Math.floor(Math.random() * 9) + 1;

	const uid = crypto.randomBytes(16).toString('hex');

	res.setHeader('Developer', DEVELOPER);
	res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; media-src 'self' blob:;`);
	res.setHeader('Cluster', `ID: ${process.pid}`);
	
	const cookie: string = req.cookies['theme'] || 'ocean';
	//if cookie in themeAccent
	const theme = themeAccent[cookie] ? cookie : 'ocean';
	const color = themeAccent[theme].secondary;
	//never expire cookie
	res.cookie('theme', theme, { maxAge: 2147483647, httpOnly: true });
	
	res.render('chat/chat', { myName: data.username, myKey: data.key, myId: uid, myAvatar: data.avatar, maxUser: data.max_users, ENV: ENVIRONMENT, hash: nonce, welcomeSticker: welcomeSticker, icon: data.icon, color: color});
}

app.get('/offline', (req, res) => {	
	blockNewChatRequest(req, res, { title: 'Offline', errorCode: 'Oops!', errorMessage: 'You are offline :(', buttonText: 'Refresh', icon: 'offline.png'});
});

app.get('*', (req, res) => {
	blockNewChatRequest(req, res, { title: 'Page not found', errorCode: '404', errorMessage: 'Page not found', buttonText: 'Home', icon: '404.png'});
});

//fire up the server
httpServer.listen(port, () => {
	console.log('------------------------------------------------------------');
	console.log('%cBooting up the server...', 'color: yellow;');
	console.log('------------------------------------------------------------');
	console.log(`Server is up on port ${port} ${accessURL}`);
    console.log(`System: ${os.type()} ${os.release()} ${os.arch()}`);
    console.log(`CPU: ${os.cpus()[0].model}`);
    console.log(`CPU Cores: ${os.cpus().length}`);
    console.log(`Memory: ${Math.round(os.totalmem()/1024/1024/1024)} Gigabytes`);
	console.log(`Free Memory: ${Math.round(os.freemem()/1024/1024/1024)} Gigabytes`);
    console.log(`Uptime: ${Math.round(os.uptime()/3600)} hours`);
    console.log(`Hostname: ${os.hostname()}`);
	console.log(`Server Version: ${version}`);
	console.log(`Developer: ${DEVELOPER}`);
	console.log(`Node.js: ${process.version}`);
	console.log(`Environment: ${ENVIRONMENT}`);
	console.log(`Process ID: ${process.pid}`);
	console.log('------------------------------------------------------------');
	if (!fs.existsSync('uploads')) {
		fs.mkdirSync('uploads');
	}
});