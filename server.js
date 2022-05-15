const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
    res.sendFile('/index.html');
});

console.log('Server running at http://localhost:3000/');

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});