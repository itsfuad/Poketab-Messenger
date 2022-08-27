const path = require('path');
const http = require('http');
const compression = require('compression');
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const socketIO = require('socket.io');
const uuid = require("uuid");
const fs = require('fs');
require('dotenv').config();

const version = process.env.npm_package_version || "Development";
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

const {isRealString, validateUserName, avList} = require('./utils/validation');
const {makeid, keyformat} = require('./utils/functions');
const {keys, uids, users, fileStore} = require('./keys/cred');
const { type } = require('os');

const apiRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests. Temporarily blocked from PokeTab server. Please try again later",
    standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

let app = express();
let server = http.createServer(app);
let io = socketIO(server,{
  maxHttpBufferSize: 1e8, pingTimeout: 60000,
  async_handlers: true
});

let fileSocket = io.of('/file');
let auth = io.of('/auth');
let callSocket = io.of('/calls');

const devMode = true;

function deleteKeys(){
  //console.log(keys);
  for (let [key, value] of keys){
    //console.dir(`${key} ${value.using}, ${value.created}, ${Date.now()}`);
    if (value.using != true && Date.now() - value.created > 120000){
      keys.delete(key);
      console.log(`Key ${key} deleted`);
    }
  }
}

function deleteFiles(){
  //read fileStore.json
  let json = fs.readFileSync('fileStore.json', 'utf8');
  if (json.length > 0) {
    let files = JSON.parse(json);
    for (let file in files){
      if (!keys.has(file)){
        //delete file
        files[file].forEach(function(filename){
          if (fs.existsSync('uploads/'+filename)){
            fs.unlinkSync('uploads/'+filename);
            //console.log(`File deleted for key ${file}`);
          }
        });
        //remove file from fileStore.json
        delete files[file];
        fs.writeFileSync('fileStore.json', JSON.stringify(files));
      }
    }
  }
}

setInterval(deleteKeys, 1000);
setInterval(deleteFiles, 2000);

app.disable('x-powered-by');

//view engine setup
app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

app.use(cors());
app.use(compression());
app.use(express.static(publicPath));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(apiRequestLimiter);

app.use('/api/files', require('./routes/router'));
app.use('/api/download', require('./routes/router'));

app.get('/', (_, res) => {
    res.render('home', {title: 'Get Started'});
});

app.get('/admin/:pass', (req, res) => {
  if (req.params.pass === ADMIN_PASS) {
    console.log('Admin access granted');
    res.send(Object.fromEntries(keys));
  } else {
    res.render('errorRes', {title: 'Fuck off!', errorCode: '401', errorMessage: 'Unauthorized access', buttonText: 'Suicide'});
  }
});

app.get('/join', (_, res) => {
  res.render('join', {title: 'Join', version: `v.${version}`, key: null, key_label: `Enter key <i id='lb__icon' class="fa-solid fa-key"></i>`});
});

app.get('/join/:key', (req, res)=>{
  const key_format = /^[0-9a-zA-Z]{3}-[0-9a-zA-Z]{3}-[0-9a-zA-Z]{3}-[0-9a-zA-Z]{3}$/;
  if (key_format.test(req.params.key)){
    res.render('join', {title: 'Join', key_label: `Checking <i id='lb__icon' class="fa-solid fa-circle-notch fa-spin"></i>` , version: `v.${version}`, key: req.params.key});
  }
  else{
    res.redirect('/join');
  }
});

app.get('/create', (req, res) => {
  const key = makeid(12);
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null; //currently ip has nothing to do with our server. May be we can use it for user validation or attacts. 
  //console.log(`${ip} created key ${key}`);
  keys.set(key, {using: false, created: Date.now(), ip: ip});
  res.render('create', {title: 'Create', version: `v.${version}`, key: key});
});

app.get('/error', (_, res) => {
  res.render('errorRes', {title: 'Fuck off!', errorCode: '401', errorMessage: 'Unauthorized Access', buttonText: 'Suicide'});
});

app.get('/chat', (_, res) => {
  res.redirect('/join');
});

app.post('/chat', (req, res) => {

  //console.log('Received chat request');

  let username = req.body.username;
  let key = req.body.key;
  let avatar = req.body.avatar;
  let maxuser = req.body.maxuser;

  if (!validateUserName(username)){
    res.status(400).send({
      error: 'Invalid username format. Please use only alphanumeric characters'
    });
  }
  if (!avList.includes(avatar)){
    res.status(400).send({
      error: 'Don\'t try to be oversmart. Choose avatar from the list'
    });
  }
  //get current users list on key
  if (keys.has(key) || devMode){
    let user = users.getUserList(key);
    let max_users = users.getMaxUser(key) ?? maxuser;
    let uid = uuid.v4();
    //console.log(user.length >= max_users);
    if (user.length >= max_users){
      //send unauthorized access message
      res.render('errorRes', {title: 'Fuck off!', errorCode: '401', errorMessage: 'Unauthorized access', buttonText: 'Suicide'});
    }else{
      res.render('chat', {myName: username, myKey: key, myId: uid, myAvatar: avatar, maxUser: max_users, version: `${version}`, devMode: devMode});
    }
  }else{
    //send invalid key message
    res.render('errorRes', {title: 'Not found', errorCode: '404', errorMessage: 'Key session not found', buttonText: 'Renew'});
  }
});

app.get('/offline', (_, res) => {
  res.render('errorRes', {title: 'Offline', errorCode: 'Oops!', errorMessage: 'You are offline :(', buttonText: 'Refresh'});
});

app.get('*', (_, res) => {
  res.render('errorRes', {title: 'Page not found', errorCode: '404', errorMessage: 'Page not found', buttonText: 'Home'});
});

io.on('connection', (socket) => {
  socket.on('join', (params, callback) => {
    console.log('Received join request');
    if (!isRealString(params.name) || !isRealString(params.key)) {
      return callback('empty');
    }
    if (params.avatar === undefined) {
      return callback('avatar');
    }
    let userList = users.getUserList(params.key);
    let user = userList.includes(params.name);
    if (user) {
      return callback('exists');
    }
    callback();
    keys.get(params.key) ? keys.get(params.key).using = true: keys.set(params.key, {using: true, created: Date.now()});
    socket.join(params.key);
    users.removeUser(params.id);
    uids.set(socket.id, params.id);
    users.addUser(params.id, params.name, params.key, params.avatar, params.maxuser || users.getMaxUser(params.key));
    io.to(params.key).emit('updateUserList', users.getAllUsersDetails(params.key));
    socket.emit('server_message', {color: 'limegreen', text: 'You joined the chat.🔥'}, 'join');
    socket.broadcast.to(params.key).emit('server_message', {color: 'limegreen', text: `${params.name} joined the chat.🔥`}, 'join');
    //console.log(`New user ${params.name} connected on key ${params.key} with avatar ${params.avatar} and maxuser ${params.maxuser || users.getMaxUser(params.key)}`);
  });


  socket.on('message', (message, type, uId, reply, replyId, options, callback) => {
    //console.log('Received new message request');
    let user = users.getUser(uids.get(socket.id));
    //console.log(user.key);
    if (user && isRealString(message)) {
      let id = uuid.v4();
      message = message.replace(/>/gi, "&gt;").replace(/</gi, "&lt;");
      //socket.emit('messageSent', messageId, id);
      socket.broadcast.to(user.key).emit('newMessage', message, type, id, uId, reply, replyId, options);
      callback(id);
      //console.log('Message sent');
    }
  });


  socket.on('react', (target, messageId, myId) => {
    //console.log('Received react request', target, messageId, myId);
    let user = users.getUser(uids.get(socket.id));
    if (user) {
      //send to all including sender
      io.to(user.key).emit('getReact', target, messageId, myId);
    }
  });


  socket.on('deletemessage', (messageId, msgUid, userName, userId) => {
    //console.log('Received delete message request');
    let user = users.getUser(uids.get(socket.id));
    if (user) {
      if (msgUid == userId){
        io.to(user.key).emit('deleteMessage', messageId, userName);
      }
    }
  });

  socket.on('createLocationMessage', (coord) => {
    //console.log('Received create location message request');
    let user = users.getUser(uids.get(socket.id));
    if (user) {
      io.to(user.key).emit('server_message', {color: 'var(--secondary-dark);', text: `<a href='https://www.google.com/maps?q=${coord.latitude},${coord.longitude}' target='_blank'><i class="fa-solid fa-location-dot" style="padding: 10px 5px 10px 0;"></i>${user.name}'s location</a>`, user: user.name}, 'location');
    }
  });


  socket.on('typing', () => {
    let user = users.getUser(uids.get(socket.id));
    if (user) {
      socket.broadcast.to(user.key).emit('typing', user.name, user.id + '-typing');
    }
  });
  socket.on('stoptyping', () => {
    let user = users.getUser(uids.get(socket.id));
    if (user) {
      socket.broadcast.to(user.key).emit('stoptyping', user.id + '-typing');
    }
  });


  socket.on('disconnect', () => {
    let user = users.removeUser(uids.get(socket.id));
    uids.delete(socket.id);
    if (user) {
      io.to(user.key).emit('updateUserList', users.getAllUsersDetails(user.key));
      io.to(user.key).emit('server_message', {color: 'orangered', text: `${user.name} left the chat.🐸`}, 'leave');
      console.log(`User ${user.name} disconnected from key ${user.key}`);
      let usercount = users.users.filter(datauser => datauser.key === user.key);
      if (usercount.length === 0) {
        users.removeMaxUser(user.key);
        //delete key from keys
        keys.delete(user.key);
        console.log(`Session ended with key: ${user.key}`);
      }
      console.log(`${usercount.length } ${usercount.length > 1 ? 'users' : 'user'} left on ${user.key}`);
    }
  });
});


//file upload
fileSocket.on('connection', (socket) => {
  socket.on('join', (key) => {
    socket.join(key);
  });

  socket.on('fileUploadStart', ( type, thumbnail, tempId, uId, reply, replyId, options, metadata, key) => {
    socket.broadcast.to(key).emit('fileDownloadStart', type, thumbnail, tempId, uId, reply, replyId, options, metadata);
  });

  socket.on('fileUploadEnd', (tempId, key, downlink, callback) => {
    //console.log('Received file upload end request => ', tempId, key, downlink, callback);
    let id = uuid.v4();
    socket.broadcast.to(key).emit('fileDownloadReady', tempId, id, downlink);
    callback(id);
    //socket.emit('fileSent', tempId, id, type, size);
  });

  socket.on('fileDownloaded', (userId, key, filename) => {
    if (fileStore.has(filename)) {
      //{filename: req.file.filename, downloaded: 0, keys: [], uids: []}
      fileStore.get(filename).downloaded++;
      if (users.getMaxUser(key) == fileStore.get(filename).downloaded + 1) {
        console.log('Deleting file');
        fs.unlinkSync(`./uploads/${filename}`);
        fileStore.delete(filename);
      }
    }
  });

  socket.on('fileUploadError', (key, id, type) => {
    socket.broadcast.to(key).emit('fileUploadError', id, type);
  });

});



auth.on('connection', (socket) => {
  //console.log('New auth connection');
  socket.on('createRequest', (key, callback) => {
    //console.log('Received create request');
    if (!keyformat.test(key)){
      callback('Invalid key');
      return;
    }
    let keyExists = users.getUserList(key).length > 0;
    if (keyExists){
      socket.emit('createResponse', {exists: keyExists});
    }
    else{
      if (keys.has(key)) {
        if (keys.get(key).using == false){
          socket.emit('createResponse', {exists: keyExists});
        }
        else{
          callback('Key is already in use');
        }
      }
      else{
        callback('Expired or invalid key');
      }
    }
  });


  socket.on('joinRequest', (key, callback) => {
    if (!keyformat.test(key)){
      return;
    }
    let keyExists = users.getUserList(key).length > 0;
    if (keyExists){
      //check if max user is reached
      let user = users.getUserList(key);
      let max_users = users.getMaxUser(key) ?? 2;
      if (user.length >= max_users){
        callback('Not Authorized');
      }else{
        socket.emit('joinResponse', {exists: keyExists, userlist: users.getUserList(key), avatarlist: users.getAvatarList(key)});
      }
    }
    else{
      socket.emit('joinResponse', {exists: keyExists});
    }
  });
});


//calling functions

var channels = {};
var sockets = {};

/**
 * Users will connect to the signaling server, after which they'll issue a "join"
 * to join a particular channel. The signaling server keeps track of all sockets
 * who are in a channel, and on join will send out 'addPeer' events to each pair
 * of users in a channel. When clients receive the 'addPeer' even they'll begin
 * setting up an RTCPeerConnection with one another. During this process they'll
 * need to relay ICECandidate information to one another, as well as SessionDescription
 * information. After all of that happens, they'll finally be able to complete
 * the peer connection and will be streaming audio/video between eachother.
 */
callSocket.on('connection', function (socket) {
    console.log(socket.channels);
    socket.channels = {};
    sockets[socket.id] = socket;

    console.log("["+ socket.id + "] connection accepted");
    socket.on('disconnect', function () {
        for (var channel in socket.channels) {
            part(channel);
        }
        console.log("["+ socket.id + "] disconnected");
        delete sockets[socket.id];
    });


    socket.on('join', function (config) {
        console.log("["+ socket.id + "] join ", config);
        var channel = config.channel;
        var userdata = config.userdata;

        if (channel in socket.channels) {
            console.log("["+ socket.id + "] ERROR: already joined ", channel);
            return;
        }

        if (!(channel in channels)) {
            channels[channel] = {};
        }

        for (id in channels[channel]) {
            channels[channel][id].emit('addPeer', {'peer_id': socket.id, 'should_create_offer': false});
            socket.emit('addPeer', {'peer_id': id, 'should_create_offer': true});
        }

        channels[channel][socket.id] = socket;
        socket.channels[channel] = channel;
    });

    function part(channel) {
        console.log("["+ socket.id + "] part ");

        if (!(channel in socket.channels)) {
            console.log("["+ socket.id + "] ERROR: not in ", channel);
            return;
        }

        delete socket.channels[channel];
        delete channels[channel][socket.id];

        for (id in channels[channel]) {
            channels[channel][id].emit('removePeer', {'peer_id': socket.id});
            socket.emit('removePeer', {'peer_id': id});
        }
    }
    socket.on('part', part);

    socket.on('relayICECandidate', function(config) {
        var peer_id = config.peer_id;
        var ice_candidate = config.ice_candidate;
        console.log("["+ socket.id + "] relaying ICE candidate to [" + peer_id + "] ", ice_candidate);

        if (peer_id in sockets) {
            sockets[peer_id].emit('iceCandidate', {'peer_id': socket.id, 'ice_candidate': ice_candidate});
        }
    });

    socket.on('relaySessionDescription', function(config) {
        var peer_id = config.peer_id;
        var session_description = config.session_description;
        console.log("["+ socket.id + "] relaying session description to [" + peer_id + "] ", session_description);

        if (peer_id in sockets) {
            sockets[peer_id].emit('sessionDescription', {'peer_id': socket.id, 'session_description': session_description});
        }
    });
});



server.listen(port, () => {
    console.log(`TCP Server listening on port ${port}`);
});
