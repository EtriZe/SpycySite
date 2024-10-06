const express = require('express');
const router = express.Router();
const config = require('./config');
const bp = require('body-parser');
router.use(bp.json());
router.use(bp.urlencoded({extended: true}));
const axios = require('axios');
const cookieParser = require('cookie-parser');
router.use(cookieParser());


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
router.post('/INSERT', config.twitch.validateJWT, async (req, res) => {
    // Récupérer les données du corps de la requête
    const { url } = req.body;

    if( ! req.twitch_informations.connected){
        res.statusMessage = "Vous n'êtes pas connecté à Twitch";
        return res.status(400).end();
    }
    const TWITCH_USER_DATA = req.twitch_informations.userInfos.data[0]
    const pseudo = TWITCH_USER_DATA.display_name;

    // Vérifier si les champs requis sont présents
    if (!url) {
        res.statusMessage = "Lien URL manquant";
        return res.status(400).end();
    }

    // Créer la requête SQL d'insertion
    const query = "INSERT INTO musics(twitchName, url) VALUES($1,$2);";

    // Exécuter la requête avec les valeurs fournies
    config.pool.query(query, [pseudo, url], (error, result) => {
        if (error) {
            res.statusMessage = "Erreur avec la base de données";
            return res.status(400).end();
        }
        // Envoyer les données insérées en réponse
        const newMusic = result.rows[0];
        res.status(201).json(newMusic); // 201 = Created
    });
});



module.exports = {
    router:router
}