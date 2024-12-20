const express = require('express');
const router = express.Router();
const config = require('./config');
const cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(express.json());
const dotenv = require("dotenv");
dotenv.config();


//Récupère le nombre de paquets de cartes ouvrable
router.get('/GETNBRPACKS',config.twitch.validateJWT, (req, res) => {
    const TWITCH_ID =  req.user.id;

    //Récupérer le nombre de pack
    const query = "select nbrpacks from public.packs where iduser = (select iduser from public.user where twitchid = $1)";
    config.pool.query(query, [TWITCH_ID],  (error, result) => {
        if (error) {
            res.status(500).send('Erreur lors de la récupération du nombre de paquets');
        } else {
            res.json(result.rows);
        }
    });
});

//Récupère le nombre de paquets de cartes ouvrable
router.get('/GETMYCARDS',config.twitch.validateJWT, (req, res) => {
    const TWITCH_ID =  req.user.id;

    //Récupérer le nombre de pack
    const query = "select dessin from collection inner join cartedessin on collection.idcarte = cartedessin.idcarte and collection.idcarteversion = cartedessin.idcarteversion where collection.iduser = (select iduser from public.user where twitchid = $1)";
    config.pool.query(query, [TWITCH_ID],  (error, result) => {
        if (error) {
            res.status(500).send('Erreur lors de la récupération du nombre de paquets');
        } else {
            res.json(result.rows);
        }
    });
});

//Récupère le nombre de paquets de cartes ouvrable
router.get('/GETRANDOMCARDS', config.twitch.validateJWT, async (req, res) => {
    const TWITCH_ID = req.user.id;

    try {
        //TODO Vérifier si l'utilisateur à bien un pack avant d'ouvrir le paquet

        // Récupérer les cartes
        const queryCards = "SELECT idcarte, name, proba FROM carte";
        const cardsRequest = await config.pool.query(queryCards);
        const cardsResult = cardsRequest.rows;

        // Récupérer les versions des cartes précédentes
        const queryVers = "SELECT idcarteversion, proba FROM carteversion";
        const versionsRequest = await config.pool.query(queryVers);
        const versionsResult = versionsRequest.rows;

        const selectedCards = [];
        const selectedVersions = [];

        for (let i = 0; i < 3; i++) {
            selectedCards.push(getOneCard(cardsResult));
            selectedVersions.push(getVersions(versionsResult));
        }
        
        const cardsDesignResult = [];

        for (let i = 0; i < 3; i++) {
            // Appliquer les cartes à la collection de l'utilisateur
            const queryInsert = "INSERT INTO public.collection (iduser,idcarte,idcarteversion) VALUES ((select iduser from public.user where twitchid = $1),$2,$3);";
            config.pool.query(queryInsert, [TWITCH_ID, selectedCards[i], selectedVersions[i]]);

            // Appliquer les cartes à la collection de l'utilisateur
            const queryDesign = "SELECT dessin FROM cartedessin WHERE idcarte = $1 AND idcarteversion = $2";
            const designResult = await config.pool.query(queryDesign, [selectedCards[i], selectedVersions[i]]);
            cardsDesignResult.push(designResult.rows);
        }



        // Envoyer la réponse combinée
        res.json(cardsDesignResult);
    } catch (error) {
        console.error("Erreur lors des requêtes SQL :", error);
        res.status(500).json({ error: "Erreur lors de l'exécution des requêtes SQL." });
    }
});

function getOneCard(rows){
    const rand = Math.random(); 

    let idCard = 0;
    let cumulative = 0;
    let proba = 0;
    for (let row of rows) {
        proba = Number(row.proba);
    
        cumulative += proba;

        if (rand <= cumulative) {
            idCard = row.idcarte;
            break;
        }
    }

    return idCard;
}

function getVersions(rows){
    const rand = Math.random(); 

    let numVersion = 0;
    let cumulative = 0;
    let proba = 0;
    for (let row of rows) {
        proba = Number(row.proba);
    
        cumulative += proba;

        if (rand <= cumulative) {
            numVersion = row.idcarteversion;
            break;
        }
    }

    return numVersion;
}

//Ajoute un nombre de cartes à l'utilisateur
router.post('/ADDNBRPACKS',  (req, res) => {
    const HOW_MUCH_MORE =  req.body.howmuch;
    const TWITCH_ID =  req.body.twitchid;

    //Récupérer le nombre de pack
    const query = "UPDATE public.packs SET nbrpacks = nbrpacks + $2 WHERE iduser = ( SELECT iduser FROM public.user WHERE twitchid = $1 );";
    config.pool.query(query, [TWITCH_ID, HOW_MUCH_MORE],  (error, result) => {
        if (error) {
            res.status(500).send('Erreur lors de l\'ajout du nombre de paquets');
        } else {
            res.json(true);
        }
    });
});

//Supprime un nombre de cartes à l'utilisateur
router.post('/REMOVENBRPACKS',  (req, res) => {
    const HOW_MUCH_LESS =  req.body.howmuch;
    const TWITCH_ID =  req.body.twitchid;

    //Récupérer le nombre de pack
    const query = "UPDATE public.packs SET nbrpacks = nbrpacks - $2 WHERE iduser = ( SELECT iduser FROM public.user WHERE twitchid = $1 );";
    config.pool.query(query, [TWITCH_ID, HOW_MUCH_LESS],  (error, result) => {
        if (error) {
            res.status(500).send('Erreur lors de l\'ajout du nombre de paquets');
        } else {
            res.json(true);
        }
    });
});



module.exports = {
    router:router
}