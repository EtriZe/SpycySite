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

//Ajoute un nombre de cartes à l'utilisateur
router.post('/ADDNBRPACKS/:howmuch/:twitchid',  (req, res) => {
    const HOW_MUCH_MORE =  req.params.howmuch;
    const TWITCH_ID =  req.params.twitchid;

    //Récupérer le nombre de pack
    const query = "update public.packs set nbrpacks = (select nbrpacks from packs where iduser = (select iduser from public.user where twitchid = $1)) + $2 where iduser = (select iduser from public.user where twitchid = $1)";
    config.pool.query(query, [TWITCH_ID, HOW_MUCH_MORE],  (error, result) => {
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