// Import required modules 
const express = require('express');
const app = express(); // Connect and Create an Express Application 
const twitch = require('js/Server');
const bdd = require('js/Server/BDD');
const path = require('path');

// Routes setup
app.use('/twitch', twitch);
app.use('/bdd', bdd);
app.use(express.static(__dirname + '/'));

const port = 3000; // By default, its 3000, you can customize

// Setup Route handler 
app.get('/', validateJWT, (req, res) => {
    res.sendFile(
        path.join(__dirname, '', 'index.html')
    );
});


// Listening to Requests 
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

module.exports = app;