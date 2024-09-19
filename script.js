// Import required modules 
const express = require('express'); 
const { Pool } = require('pg'); 
const path = require('path'); 
const bodyParser = require('body-parser');

const app = express(); // Connect and Create an Express Application 
const port = 3000; // By default, its 3000, you can customize

// Create a Postgres Connection 
const pool = new Pool({ 
    user: 'postgres', 
    host: 'localhost', 
    database: 'spycysite', 
    password: 'admin', // Change to your password port: 5432, // Default Port 
});

app.use(
    express.static(path.join(''))
);

// Setup Route handler 
app.get('/', (req, res) => { 
    res.sendFile(
        path.join(__dirname, '', 'index.html')
    ); 
});


// Route handler for GET student data 
app.get('/Musiques', (req, res) => { 
        const query = 'SELECT * FROM musics;';
        pool.query(query, (error, result) => { 
            if (error) { 
                console.log('Error occurred:', error); 
                res.status(500).send('An error occurred while retrieving data from the database.'); 
            } else { 
                const musics = result.rows; 
                res.json(musics); 
            } 
        });
    }
);

// Listening to Requests 
app.listen(port, () => { 
    console.log(`Server listening on port ${port}`); 
});