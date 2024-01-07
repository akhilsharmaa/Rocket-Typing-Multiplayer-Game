const express = require('express');
const app = express();
const join  = require('node:path');
const Server = require("socket.io");

const port = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Set the views directory


// Serve static files from the 'public' directory
app.use(express.static('public'));

app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/public/index');
  res.render('index', { message: 'This is a dynamic message from the server!' });

});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}); 