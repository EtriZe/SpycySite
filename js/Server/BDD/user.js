const express = require('express');
const router = express.Router();
const config = require('./config');
const cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(express.json());
const dotenv = require("dotenv");
dotenv.config();


//Sauvegarde les informations de l'utilisateur TWITCH SI il n'est pas déjà dans la BDD
router.post('/ADDUSER', config.twitch.validateJWT, (req, res) => {

    const PSEUDO = req.body.name;
    const TWITCH_ID =  req.body.id;
    
    if(PSEUDO === undefined) return;
    const query = "INSERT INTO public.user(twitchname, twitchid) SELECT $1, $2 WHERE NOT EXISTS ( SELECT iduser FROM public.user WHERE twitchId = $2);";
    config.pool.query(query, [PSEUDO, TWITCH_ID],  (error, result) => {
        if (error) {
            // console.log('Error occurred:', error);
            res.status(500).send('An error occurred while retrieving data from the database.');
        } else {
            res.json(result.rows);
        }
    });
});

module.exports = {
    router:router
}