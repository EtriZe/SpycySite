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
app.get('/musicsGalerie', (req, res) => { 
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

app.use(express.json());

// Route handler for POST to add new music
app.post('/insertNewMusic', (req, res) => {
    // Récupérer les données du corps de la requête
    const { url } = req.body;

    // Vérifier si les champs requis sont présents
    if (!url) {
        return res.status(400).send('Field URL is required.');
    }

    // Créer la requête SQL d'insertion
    // const query = "INSERT INTO musics VALUES ('EtriZe',$1)";
    const query = "INSERT INTO musics(twitchName, url) VALUES('EtriZe',$1);";

    // Exécuter la requête avec les valeurs fournies
    pool.query(query, [url], (error, result) => {
        if (error) {
            console.error('Error occurred:', error);
            return res.status(500).send('An error occurred while inserting data into the database.');
        }

        // Envoyer les données insérées en réponse
        const newMusic = result.rows[0];
        res.status(201).json(newMusic); // 201 = Created
    });
});


app.get("/Home", (req,res) => {
    console.log("Bonjour : ", req , res);
});

// Listening to Requests 
app.listen(port, () => { 
    console.log(`Server listening on port ${port}`); 
});