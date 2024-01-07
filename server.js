
const http = require("http");
const { createServer } = require('node:http');
const express = require('express');
const app = express();
const join  = require('node:path');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Set the views directory


// Serve static files from the 'public' directory
app.use(express.static('public'));

// ------------ SOCKET -------------------------------

io.on('connection', (socket) => {

  console.log('a user connected', socket.id);

  socket.on('disconnect', () => {
      console.log('A user disconnected');
  });
});

// --------------------------------------------------

app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/public/index');
  res.render('index', { message: 'This is a dynamic message from the server!' });

});


server.listen(PORT, () => {
  console.log('server running at http://localhost:3000');
});