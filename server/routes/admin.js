const router = require('express').Router();
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const { HMAC_KEY } = require('./../server.js');

const { Keys } = require('./../credentialManager.js');

router.get('/', cookieParser(HMAC_KEY), (req, res) => {
	const cookieFromClient = req.signedCookies.auth;
	//console.log('Got get request for admin page');
	if (cookieFromClient){
		//if the cookie is set, check if the cookie is valid
		const salt = process.env.SALT;
		const signature = crypto.createHmac('sha256', HMAC_KEY).update(process.env.ADMIN_USERNAME + salt + process.env.ADMIN_PASSWORD).digest('hex');
		if (cookieFromClient == signature){
			//if the cookie is valid, render the admin page
			console.log('Valid cookie found. Rendering admin page');
			const nonce = crypto.randomBytes(16).toString('hex');
			res.setHeader('Content-Security-Policy', `default-src 'self'; style-src 'self' 'nonce-${nonce}'; img-src 'self' data:; script-src 'nonce-${nonce}';`);
			res.setHeader('Developer', 'Fuad Hasan');
			res.render('adminLogin', {title: 'Admin Dashboard', admin: process.env.ADMIN_USERNAME, hash: nonce, loginScript: false});
		}else{
			//if the cookie is invalid, redirect to the login page
			console.log('Invalid cookie found. Redirecting to login page');
			const nonce = crypto.randomBytes(16).toString('hex');
			res.setHeader('Content-Security-Policy', `default-src 'self'; style-src 'self' 'nonce-${nonce}'; img-src 'self' data:; script-src 'nonce-${nonce}';`);
			res.setHeader('Developer', 'Fuad Hasan');
			res.clearCookie('auth');
			res.render('adminLogin', {title: 'Please login', admin: 'Not logged in', hash: nonce, loginScript: true});
		}
	}else{
		console.log('No cookie found. Redirecting to login page');
		const nonce = crypto.randomBytes(16).toString('hex');
		res.setHeader('Content-Security-Policy', `default-src 'self'; style-src 'self' 'nonce-${nonce}'; img-src 'self' data:; script-src 'nonce-${nonce}';`);
		res.setHeader('Developer', 'Fuad Hasan');
		res.clearCookie('auth');
		res.render('adminLogin', {title: 'Please login', admin: 'Not logged in', hash: nonce, loginScript: true});
	}
});

router.post('/', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	const admin_username = process.env.ADMIN_USERNAME;
	const admin_password = process.env.ADMIN_PASSWORD;

	//console.log('Got post request for admin page');
	
	if (username == admin_username && password == admin_password){
		console.log('Admin login successful');
		const salt = crypto.randomBytes(16).toString('hex');
		const signature = crypto.createHmac('sha256', HMAC_KEY).update(admin_username + salt + admin_password).digest('hex');
		process.env.SALT = salt;
		res.cookie('auth', signature, {maxAge: 900000, httpOnly: true, sameSite: 'strict', signed: true});
		res.status(200).send('Authorized');
	}else{
		console.log('Admin login failed');
		res.clearCookie('auth');
		res.status(403).send('Unauthorized');
	}
});

//route to send running chat numbers and create new chat keys to the admin
router.post('/data', cookieParser(), (req, res) => {

	const salt = process.env.SALT;
	const admin_username = process.env.ADMIN_USERNAME;
	const admin_password = process.env.ADMIN_PASSWORD;

	const signature = crypto.createHmac('sha256', HMAC_KEY).update(admin_username + salt + admin_password).digest('hex');

	console.log(signature, req.signedCookies.auth);

	if (req.signedCookies.auth == signature) {
		res.status(200).send(Object.fromEntries(Keys));
	} else {
		//console.log('Admin access denied');
		res.status(403).send('Session expired');
	}
});

router.post('/changePassword', cookieParser(), (req, res) => {
	const username = req.body.username;
	const password = req.body.oldPassword;
	const newPassword = req.body.newPassword;

	const salt = process.env.SALT;
	const admin_username = process.env.ADMIN_USERNAME;
	const admin_password = process.env.ADMIN_PASSWORD;

	const signature = crypto.createHmac('sha256', HMAC_KEY).update(admin_username + salt + admin_password).digest('hex');

	if (req.signedCookies.auth == signature) {
		if (password == admin_password) {
			const newSalt = crypto.randomBytes(16).toString('hex');

			process.env.SALT = newSalt;
			process.env.ADMIN_USERNAME = username;
			process.env.ADMIN_PASSWORD = newPassword;

			const newSignature = crypto.createHmac('sha256', HMAC_KEY).update(username + newSalt + newPassword).digest('hex');
			
			console.log('Password changed');

			res.cookie('auth', newSignature, {maxAge: 900000, httpOnly: true, sameSite: 'strict', signed: true});
			res.status(200).send('Password changed');
		} else {
			console.log('Password change failed');
			res.status(401).send('Password not changed');
		}
	} else {
		res.status(403).send('Session expired');
	}
});

router.delete('/', (_, res) => {
	res.clearCookie('auth');
	res.status(200).send('Cookie cleared');
});

router.get('*', (req, res) => {
	//unknown route
	res.status(404).send({ error: 'Unknown route' });
});

module.exports = router;