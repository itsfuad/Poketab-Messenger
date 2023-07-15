/**
 * This file contains the routes for the admin page
 * This is not used to get any sensitive data of the users.
 * This is used to get a list of all the chat keys and the number of users in each chat
 * This helps us to make analytics about our system.
 */
import { Router } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { HMAC_KEY } from '../expressApp.js';
import { Keys } from '../database/db.js';
const AdminSessionSecret = new Map();
const router = Router();
export default router;
router.get('/', cookieParser(HMAC_KEY), (req, res) => {
    const cookieFromClient = req.signedCookies.auth;
    //console.log('Got get request for admin page');
    if (cookieFromClient) {
        //if the cookie is set, check if the cookie is valid
        const salt = process.env.SALT;
        const username = process.env.ADMIN_USERNAME || '';
        const password = process.env.ADMIN_PASSWORD || '';
        const signature = crypto.createHmac('sha256', HMAC_KEY).update(username + salt + password).digest('hex');
        if (cookieFromClient == signature) {
            //if the cookie is valid, render the admin page
            console.log('Valid cookie found. Rendering admin page');
            const nonce = crypto.randomBytes(16).toString('hex');
            const adminSessionID = crypto.randomUUID();
            AdminSessionSecret.set('Admin', adminSessionID);
            res.setHeader('Content-Security-Policy', `default-src 'self'; style-src 'self' 'nonce-${nonce}'; img-src 'self' data:; script-src 'nonce-${nonce}';`);
            res.setHeader('Developer', 'Fuad Hasan');
            res.render('admin/adminLogin', { title: 'Admin Dashboard', admin: process.env.ADMIN_USERNAME, hash: nonce, loginScript: false, session: adminSessionID });
        }
        else {
            //if the cookie is invalid, redirect to the login page
            console.log('Invalid cookie found. Redirecting to login page');
            const nonce = crypto.randomBytes(16).toString('hex');
            res.setHeader('Content-Security-Policy', `default-src 'self'; style-src 'self' 'nonce-${nonce}'; img-src 'self' data:; script-src 'nonce-${nonce}';`);
            res.setHeader('Developer', 'Fuad Hasan');
            res.clearCookie('auth');
            res.render('admin/adminLogin', { title: 'Please login', admin: 'Not logged in', hash: nonce, loginScript: true, session: null });
        }
    }
    else {
        console.log('No cookie found. Redirecting to login page');
        const nonce = crypto.randomBytes(16).toString('hex');
        res.setHeader('Content-Security-Policy', `default-src 'self'; style-src 'self' 'nonce-${nonce}'; img-src 'self' data:; script-src 'nonce-${nonce}';`);
        res.setHeader('Developer', 'Fuad Hasan');
        res.clearCookie('auth');
        res.render('admin/adminLogin', { title: 'Please login', admin: 'Not logged in', hash: nonce, loginScript: true, session: null });
    }
});
router.post('/', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const admin_username = process.env.ADMIN_USERNAME;
    const admin_password = process.env.ADMIN_PASSWORD;
    const sessionID = crypto.randomUUID();
    AdminSessionSecret.set('Admin', sessionID);
    //console.log('Got post request for admin page');
    if (username == admin_username && password == admin_password) {
        console.log('Admin login successful');
        const salt = crypto.randomBytes(16).toString('hex');
        const signature = crypto.createHmac('sha256', HMAC_KEY).update(admin_username + salt + admin_password).digest('hex');
        process.env.SALT = salt;
        res.cookie('auth', signature, { maxAge: 900000, httpOnly: true, sameSite: 'strict', signed: true });
        res.status(200).send({ message: 'Authorized', sessionID: sessionID });
    }
    else {
        console.log('Admin login failed');
        res.clearCookie('auth');
        res.status(403).send({ message: 'Unauthorized' });
    }
});
//route to send running chat numbers and create new chat keys to the admin
router.post('/data', cookieParser(HMAC_KEY), (req, res) => {
    const salt = process.env.SALT;
    const admin_username = process.env.ADMIN_USERNAME || '';
    const admin_password = process.env.ADMIN_PASSWORD || '';
    const sessionId = req.body.sessionID;
    const signature = crypto.createHmac('sha256', HMAC_KEY).update(admin_username + salt + admin_password).digest('hex');
    console.log(req.signedCookies);
    if (req.signedCookies.auth == signature) {
        if (sessionId == AdminSessionSecret.get('Admin')) {
            console.log('Sending chat keys');
            res.status(200).send(Keys);
        }
        else {
            res.status(403).send('Unauthorized');
        }
    }
    else {
        //console.log('Admin access denied');
        res.status(403).send('Session expired');
    }
});
router.post('/changePassword', cookieParser(HMAC_KEY), (req, res) => {
    const username = req.body.username;
    const password = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const salt = process.env.SALT;
    const admin_username = process.env.ADMIN_USERNAME || '';
    const admin_password = process.env.ADMIN_PASSWORD || '';
    const signature = crypto.createHmac('sha256', HMAC_KEY).update(admin_username + salt + admin_password).digest('hex');
    if (req.signedCookies.auth == signature) {
        if (password == admin_password) {
            const newSalt = crypto.randomBytes(16).toString('hex');
            process.env.SALT = newSalt;
            process.env.ADMIN_USERNAME = username;
            process.env.ADMIN_PASSWORD = newPassword;
            const newSignature = crypto.createHmac('sha256', HMAC_KEY).update(username + newSalt + newPassword).digest('hex');
            console.log('Password changed');
            res.cookie('auth', newSignature, { maxAge: 900000, httpOnly: true, sameSite: 'strict', signed: true });
            res.status(200).send('Password changed');
        }
        else {
            console.log('Password change failed');
            res.status(401).send('Password not changed');
        }
    }
    else {
        res.status(403).send('Session expired');
    }
});
router.delete('/', (_, res) => {
    res.clearCookie('auth');
    res.status(200).send('Cookie cleared');
});
//# sourceMappingURL=admin.js.map