const path = require('path');
const http = require('http');
const compression = require('compression');
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const socketIO = require('socket.io');
const uuid = require("uuid");

const version = process.env.npm_package_version;

const {Users} = require('./utils/users');
const {isRealString, validateUserName} = require('./utils/validation');
const {makeid, keyformat} = require('./utils/functions');


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
let io = socketIO(server);
let users = new Users();


const keys = new Map();

function deleteKeys(){
  for (let [key, value] of keys){
    //console.dir(`${key} ${value.using}, ${value.created}, ${Date.now()}`);
    if (value.using != true && Date.now() - value.created > 60000){
      keys.delete(key);
      console.log(`Key ${key} deleted`);
    }
  }
}

setInterval(deleteKeys, 1000);

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

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', {version: `v.${version}`, key: null});
});

app.get('/create', (req, res) => {
  const key = makeid(12);
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  console.log(`${ip} created key ${key}`);
  keys.set(key, {using: false, created: Date.now(), ip: ip});
  res.render('create', {version: `v.${version}`, key: key});
});

app.post('/chat', (req, res) => {

  console.dir('Received chat request' + req.body);

  let username = req.body.username;
  let key = req.body.key;
  let avatar = req.body.avatar;
  let maxuser = req.body.maxuser;

  if (!validateUserName(username)){
    res.status(400).send({
      error: 'Invalid username format. Please use only alphanumeric characters'
    });
  }
  //get current users list on key
  if (keys.has(key) && keys.get(key).ip == req.ip){
    let user = users.getUserList(key);
    let max_users = users.getMaxUser(key);
    let uid = uuid.v4();
    if (user.length >= max_users){
      //send unauthorized access message
      res.status(401).send({
        message: "Unauthorized access",
      });
    }
    res.render('chat', {myname: username, mykey: key, myid: uid, myavatar: avatar, maxuser: maxuser || max_users});
  }else{
    //send invalid key message
    res.status(401).send({
      message: "Invalid or Expired key"
    });
  }
});


app.post('/varify', (req, res) => {
  let key = req.body.key;
  if (keyformat.test(key)){
    let userlist = users.getUserList(key);
    let avatarlist = users.getAvatarList(key);
    if (userlist.length > 0){
      res.status(200).send({
        exists: true,
        userlist: userlist,
        avatarlist: avatarlist
      });
    }else{
      res.status(200).send({
        exists: false,
        userlist: userlist,
        avatarlist: avatarlist
      });
    }
  }else{
    res.status(200).send({
      message: "Invalid or Expired key"
    });
  }
});


io.on('connection', (socket) => {
  socket.on('createRequest', (key, callback) => {
    console.log('validating from server', key, keys.has(key));
    let keyExists = users.getUserList(key).length > 0;
    if (keyExists){
      socket.emit('createResponse', {exists: keyExists});
    }
    else{
      if (keyformat.test(key) && (keys.has(key))) {
        if (keys.get(key).using == false){
          console.log('Creating new key: ' + key);
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

});



server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
