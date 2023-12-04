import path from 'node:path';
import http from 'node:http';
import express from 'npm:express';
import { randomBytes } from 'node:crypto';
import compression from 'npm:compression';
import cookieParser from 'npm:cookie-parser';
import ejs from 'npm:ejs';

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

//disable x-powered-by header showing express in the response
app.disable('x-powered-by');

//view engine setup
app.set('views', path.join(publicPath, '/views'));
app.set('view engine', 'ejs'); //set the view engine to ejs [embedded javascript] to allow for dynamic html
app.set('trust proxy', 1);

export const httpServer = http.createServer(app);