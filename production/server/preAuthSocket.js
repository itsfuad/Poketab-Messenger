//buit in modules
import crypto from 'crypto';
import { keyStore } from './database/db.js';
import { validateKey } from './utils/validation.js';
import { auth } from './sockets.js';
function keyCheck(key) {
    try {
        if (!validateKey(key)) {
            return { success: false, message: 'Invalid Key', icon: '<i class="fa-solid fa-triangle-exclamation"></i>', blocked: false };
        }
        const keyExists = keyStore.hasKey(key);
        if (keyExists) {
            //check if key has space for more users
            const max_users = keyStore.getKey(key).maxUser;
            const userCount = keyStore.getKey(key).activeUsers;
            //console.log(`Key ${key} has ${userCount} users out of ${max_users} | ${Keys[key]}`);
            if (userCount >= max_users) {
                return { success: false, message: 'Not Authorized. Key is full', icon: '<i class="fa-solid fa-triangle-exclamation"></i>', blocked: true };
            }
            else {
                //allow user to join
                const data = keyStore.getUserList(key).map((user) => { return { hash: crypto.createHash('sha256').update(user.username).digest('hex'), name: user.username, avatar: user.avatar }; });
                return { success: true, message: data, block: false };
            }
        }
        else {
            return { success: false, message: 'Key does not exist', icon: '<i class="fa-solid fa-ghost"></i>', blocked: false };
        }
    }
    catch (err) {
        console.log(err);
    }
}
export const askToJoinUserSocket = new Map();
const deleterMap = new Map();
auth.on('connection', (socket) => {
    socket.on('joinRequest', (key, callback) => {
        try {
            //console.log('joinRequest received');
            const existing = askToJoinUserSocket.get(key);
            if (existing) {
                existing.add(socket);
            }
            else {
                askToJoinUserSocket.set(key, new Set([socket]));
            }
            //console.log(askToJoinUserSocket);
            deleterMap.set(socket, key);
            callback(keyCheck(key));
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on('disconnect', () => {
        try {
            const key = deleterMap.get(socket);
            if (key) {
                const existing = askToJoinUserSocket.get(key);
                if (existing) {
                    existing.delete(socket);
                }
            }
            deleterMap.delete(socket);
        }
        catch (err) {
            console.log(err);
        }
    });
});
//# sourceMappingURL=preAuthSocket.js.map