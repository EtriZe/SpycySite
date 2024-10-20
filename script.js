// Import required modules 
const express = require('express');
const app = express(); // Connect and Create an Express Application 
const twitch = require('./js/Server/twitchOauth');
const musics = require('./js/Server/BDD/musics');
const user = require('./js/Server/BDD/user');

const path = require('path');

// Routes setup
app.use('/twitch', twitch.router);
app.use('/musics', musics.router);
app.use('/user', user.router);

app.use(express.static(__dirname + '/'));

const port = 3000; // By default, its 3000, you can customize

// Setup Route handler 
app.get('/', twitch.validateJWT, (req, res) => {
    res.sendFile(
        path.join(__dirname, '', 'index.html')
    );
});


// Listening to Requests 
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

module.exports = app;