//socketio server which can handle multiple connections and reconnects from the client
import { server } from './expressApp.js';
import { Server } from 'socket.io';
//utility functions for the server
import { avList, isRealString, reactArray, validateKey } from './utils/validation.js';
import { keyStore, SocketIds } from './database/db.js';
import { User } from './database/schema/User.js';
import crypto from 'crypto';
import { cleanJunks } from './cleaner.js';
export const io = new Server(server);
//socket.io connection
io.on('connection', (socket) => {
    try {
        socket.on('join', (params, callback) => {
            if (!isRealString(params.name) || !isRealString(params.key)) {
                return callback('Empty informations');
            }
            if (params.avatar === undefined || !avList.includes(params.avatar)) {
                return callback('Invalid Avatar');
            }
            if (params.maxUser === undefined) {
                return callback('Invalid Max User');
            }
            if (params.maxUser < 2 || params.maxUser > 10) {
                return callback('Invalid Max User Range');
            }
            if (params.key == null || validateKey(params.key) === false) {
                return callback('Invalid Key');
            }
            if (keyStore.isFull(params.key)) {
                return callback('Key is full.');
            }
            //if the key is not new
            if (keyStore.getKey(params.key)) {
                //get all taken avatars
                const takenAvatars = keyStore.getUserList(params.key).map((user) => user.avatar);
                //check if the avatar is taken
                //console.log(takenAvatars);
                if (takenAvatars.includes(params.avatar)) {
                    return callback('Avatar is taken');
                }
            }
            keyStore.addUser(params.key, new User(params.name, params.id, params.avatar), params.maxUser);
            console.log(`User ${params.name} joined key ${params.key} | ${keyStore.getUserList(params.key).length} user(s) out of ${keyStore.getKey(params.key).maxUser}`);
            const userList = keyStore.getUserList(params.key);
            callback();
            socket.join(params.key);
            SocketIds[socket.id] = { uid: params.id, key: params.key };
            io.to(params.key).emit('updateUserList', userList);
            const srvID = crypto.randomUUID();
            socket.emit('server_message', { color: 'dodgerblue', text: 'You joined the chat.🔥', id: srvID }, 'join');
            socket.broadcast.to(params.key).emit('server_message', { color: 'dodgerblue', text: `${params.name} joined the chat.🔥`, id: srvID }, 'join');
        });
        socket.on('message', (message, type, uId, reply, replyId, options, callback) => {
            //const user = users.getUser(uids.get(socket.id));
            if (isRealString(message)) {
                const id = crypto.randomUUID();
                //console.log(`Message: ${message}`);
                socket.broadcast.to(SocketIds[socket.id].key).emit('newMessage', message, type, id, uId, reply, replyId, options);
                callback(id);
            }
        });
        socket.on('seen', (meta) => {
            if (SocketIds[socket.id]) {
                socket.broadcast.to(SocketIds[socket.id].key).emit('seen', meta);
            }
        });
        socket.on('react', (target, messageId, myId) => {
            if (SocketIds[socket.id]) {
                if (reactArray.primary.includes(target) || reactArray.expanded.includes(target)) {
                    io.to(SocketIds[socket.id].key).emit('getReact', target, messageId, myId);
                }
            }
        });
        socket.on('deletemessage', (messageId, msgUid, userName, userId) => {
            if (SocketIds[socket.id]) {
                if (msgUid == userId) {
                    io.to(SocketIds[socket.id].key).emit('deleteMessage', messageId, userName);
                }
            }
        });
        socket.on('createLocationMessage', (coord) => {
            if (SocketIds[socket.id]) {
                const srvID = crypto.randomUUID();
                io.to(SocketIds[socket.id].key).emit('server_message', { color: 'var(--secondary-dark);', coordinate: { longitude: coord.longitude, latitude: coord.latitude }, user: keyStore.getKey(SocketIds[socket.id].key).getUser(SocketIds[socket.id].uid).username, id: srvID }, 'location');
            }
        });
        socket.on('typing', () => {
            if (SocketIds[socket.id]) {
                const key = SocketIds[socket.id].key;
                const { username, uid } = keyStore.getKey(key).getUser(SocketIds[socket.id].uid);
                socket.broadcast.to(key).emit('typing', username, uid);
            }
        });
        socket.on('stoptyping', () => {
            if (SocketIds[socket.id]) {
                const key = SocketIds[socket.id].key;
                const { uid } = keyStore.getKey(key).getUser(SocketIds[socket.id].uid);
                socket.broadcast.to(key).emit('stoptyping', uid);
            }
        });
        socket.on('disconnect', () => {
            //console.log('User disconnected');
            if (SocketIds[socket.id]) {
                const key = SocketIds[socket.id].key;
                const user = keyStore.getKey(key).getUser(SocketIds[socket.id].uid);
                console.log(`User ${user.username} disconnected from key ${key}`);
                keyStore.getKey(key).removeUser(SocketIds[socket.id].uid);
                delete SocketIds[socket.id];
                socket.leave(key);
                const users = keyStore.getKey(key).getUserList();
                //console.log(users);
                socket.broadcast.to(key).emit('updateUserList', users);
                const srvID = crypto.randomUUID();
                socket.broadcast.to(key).emit('server_message', { color: 'lightslategray', text: `${user.username} left the chat.🐸`, who: user.uid, id: srvID }, 'leave');
                //console.log(`User ${user.username} disconnected from key ${user.key}`);
                const remainingUsers = keyStore.getKey(key).userCount;
                console.log(`%c${remainingUsers == 0 ? 'No' : remainingUsers} ${remainingUsers > 1 ? 'users' : 'user'} left on ${key}`, 'color: orange');
                if (remainingUsers == 0) {
                    keyStore.clearKey(key);
                    cleanJunks();
                    console.log(`%cSession ended with key: ${key}`, 'color: orange');
                }
            }
        });
    }
    catch (err) {
        console.log(err);
    }
});
//# sourceMappingURL=websockets.js.map