import http from 'http';
import express from 'express';
import { randomBytes } from 'crypto';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { blockedMessage } from './utils/blockedMessage.js';
import cookieParser from 'cookie-parser';
import path from 'path';

export const HMAC_KEY = randomBytes(64).toString('hex');

const __dirname = process.cwd();

//public path to serve static files
export const publicPath = path.join(__dirname, '/public');

//create the express app
export const app = express();

app.use(compression()); //compress all responses
app.use(express.static(publicPath)); //serve static files from the public folder
app.use(express.json()); //parse json data
//parse url encoded data in the body of the request
app.use(express.urlencoded({ 
	extended: false
}));

app.use(cookieParser(HMAC_KEY));

//this blocks the client if they request 100 requests in 15 minutes
const apiRequestLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minute
	max: 100, // limit each IP to 100 requests per windowMs
	message: blockedMessage,
	standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

app.use(apiRequestLimiter); //limit the number of requests to 100 in 15 minutes

//disable x-powered-by header showing express in the response
app.disable('x-powered-by');

//view engine setup
app.set('views', path.join(publicPath, '/views'));
app.set('view engine', 'ejs'); //set the view engine to ejs [embedded javascript] to allow for dynamic html
app.set('trust proxy', 1);

export const httpServer = http.createServer(app);