const express = require('express');
const router = express.Router();
const config = require('./config');
const bp = require('body-parser');
router.use(bp.json());
router.use(bp.urlencoded({extended: true}));
const axios = require('axios');
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const dotenv = require("dotenv");
dotenv.config();


// Route handler for GET musics data 
router.get('/GET/:page', config.twitch.validateJWT, (req, res) => {
    const PAGE = req.params.page;
    const LIMIT = 9;
    const MIN_ID = LIMIT * (PAGE - 1);

    const query = 'SELECT musics.*, public.user.twitchname FROM musics INNER JOIN public.user ON musics.iduser = public.user.iduser ORDER BY idmusic DESC LIMIT $1 OFFSET $2;';
    config.pool.query(query, [LIMIT, MIN_ID],  (error, result) => {
        if (error) {
            console.log('Error occurred:', error);
            res.status(400).send('An error occurred while retrieving data from the database.');
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
    if(req.user === undefined) {
        res.status(400).send('Not Twitch connected');
        return;
    }
    
    const TWITCH_ID = req.user.id;

    if( ! req.twitch_informations.connected){
        res.statusMessage = "Vous n'êtes pas connecté à Twitch";
        return res.status(400).end();
    }

    
    // Vérifier si les champs requis sont présents
    if (!url) {
        res.statusMessage = "Lien URL manquant";
        return res.status(400).end();
    }

    // Créer la requête SQL d'insertion
    const query = "INSERT INTO musics(url, liked, iduser) VALUES($1,false,(SELECT iduser FROM public.user WHERE twitchid = $2));";

    // Exécuter la requête avec les valeurs fournies
    config.pool.query(query, [url, TWITCH_ID], (error, result) => {
        if (error) {
            console.log(error);
            res.statusMessage = "Erreur avec la base de données";
            return res.status(400).end();
        }
        // Envoyer les données insérées en réponse
        const newMusic = result.rows[0];
        res.status(201).json(newMusic); // 201 = Created
    });
});

// Route handler for LIKE a song
router.post('/LIKE', config.twitch.validateJWT, async (req, res) => {
    // Récupérer les données du corps de la requête
    const { isLiked, idValue } = req.body;

    if( ! req.twitch_informations.connected){
        res.statusMessage = "Vous n'êtes pas connecté à Twitch";
        return res.status(400).end();
    }

    const TWITCH_USER_DATA = req.twitch_informations.userInfos.data[0];
    const pseudo = TWITCH_USER_DATA.display_name;
    let IsAdmin = false;

    switch(TWITCH_USER_DATA.id){
        // case process.env.TWITCH_ADMIN_ID_VAL :
        case process.env.TWITCH_ADMIN_ID_VAL :
            IsAdmin = true;
            break;
        default:
            IsAdmin = false;
            break;
    }

    if( ! IsAdmin) {
        res.statusMessage = "Vous n'êtes pas administrateur";
        return res.status(400).end();
    }

    // Créer la requête SQL d'insertion
    const query = "UPDATE musics SET liked = $1 WHERE idmusic = $2 AND twitchname = $3;";
    // Exécuter la requête avec les valeurs fournies
    config.pool.query(query, [isLiked, idValue, pseudo], (error, result) => {
        if (error) {
            res.statusMessage = "Erreur avec la base de données";
            return res.status(400).end();
        }
        res.status(201).json("Like Réussi"); // 201 = Created
    });
});


module.exports = {
    router:router
}