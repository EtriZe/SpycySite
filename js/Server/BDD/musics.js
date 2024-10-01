const express = require('express');
const router = express.Router();
const config = require('./js/Server/BDD/config');
const twitch = require('./js/Server/twitchOauth');

// router.use('/twitch', twitch.router);
// Route handler for GET student data 
router.get('/GET', (req, res) => {
    const query = 'SELECT * FROM musics;';
    config.pool.query(query, (error, result) => {
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


// Route handler for POST to add new music
router.post('/INSERT', (req, res) => {
    // Récupérer les données du corps de la requête
    const { pseudo, url } = req.body;

    // Vérifier si les champs requis sont présents
    if (!url) {
        return res.status(400).send('Field URL is required.');
    }

    // Créer la requête SQL d'insertion
    // const query = "INSERT INTO musics VALUES ('EtriZe',$1)";
    const query = "INSERT INTO musics(twitchName, url) VALUES($1,$2);";

    // Exécuter la requête avec les valeurs fournies
    config.pool.query(query, [pseudo, url], (error, result) => {
        if (error) {
            console.error('Error occurred:', error);
            return res.status(500).send('An error occurred while inserting data into the database.');
        }
        // Envoyer les données insérées en réponse
        const newMusic = result.rows[0];
        res.status(201).json(newMusic); // 201 = Created
    });
});