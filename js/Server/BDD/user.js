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
            res.status(400).send('Problème lors de l\'ajout de l\'utilisateur dans la base de données : Pseudo : '+ PSEUDO + 'TWITCH ID :' + TWITCH_ID);
        } else {

            if(result.rowCount === 0){// Utilisateur déjà présent dans l'appli donc pas besoin de refaire la ligne de dessous.
                res.json(true);
                return;
            }  

            const queryPacks = "INSERT INTO public.packs(iduser, nbrpacks) VALUES((select iduser from public.user where twitchid = $1), 0);";
            config.pool.query(queryPacks, [TWITCH_ID],  (errorPacks, resultPacks) => {
                if (error) {
                    res.status(400).send('Problème lors de l\'ajout de l\'utilisateur dans la base des packs');
                } else {
                    res.json(true);
                }
            });
        }
    });
});


router.get('/GETUSER', config.twitch.validateJWT,  (req, res) => {
    const TWITCH_ID =  req.body.id;
    
    const query = 'SELECT * FROM public.user WHERE twitchid = $1 ;';
    config.pool.query(query, [TWITCH_ID],  (error, result) => {
        if (error) {
            console.log('Error occurred:', error);
            res.status(400).send('An error occurred while retrieving data from the database.');
        } else {
            res.json(result.rows);
        }
    });
});

module.exports = {
    router:router
}