import http from 'http';
import express from 'express';
import { randomBytes } from 'crypto';

export const HMAC_KEY = randomBytes(64).toString('hex');

//create the express app
export const app = express();
export default express;

export const server = http.createServer(app);