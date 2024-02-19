import { Server } from 'socket.io';
import { httpServer } from './expressApp.js';

const io = new Server(httpServer);

//socket handler is used to handle chat messages
export const chatSocket = io.of('/chat');
//file socket handler is used to handle file transfers metadata but not the actual file transfer
export const fileSocket = io.of('/file');
//The worker threads module provides a way to create multiple environments running on separate threads that can communicate with each other via inter-thread messaging or sharing memory.
export const auth = io.of('/auth');