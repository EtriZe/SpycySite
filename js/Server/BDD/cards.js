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
router.get('/GETRANDOMCARDS', config.twitch.validateJWT, async (req, res) => {
    const TWITCH_ID = req.user.id;

    try {
        // Récupérer les cartes
        const queryCards = "SELECT idcarte, name, proba FROM carte";
        const [cardsResult] = await config.pool.query(queryCards);

        const selectedCards = [];
        for (let i = 0; i < 3; i++) {
            selectedCards.push(getOneCard(cardsResult));
        }

        // Récupérer les versions des cartes précédentes
        const queryVers = "SELECT idcarteversion, idproba FROM carteversion";
        const [versionsResult] = await config.pool.query(queryVers);

        const selectedVersions = [];
        for (let i = 0; i < 3; i++) {
            selectedVersions.push(getVersions(versionsResult));
        }

        // Envoyer la réponse combinée
        res.json({
            cards: selectedCards,
            versions: selectedVersions,
        });
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