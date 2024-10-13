const express = require('express');
const SCOPES = ["user_read"];
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
dotenv.config();

// Diverses fonctions utilitaires
const helpers = {
    // Encode un objet sous forme d'une querystring utilisable dans une URL :
    encodeQueryString: function (params) {
        const queryString = new URLSearchParams();
        for (let paramName in params) {
            queryString.append(paramName, params[paramName]);
        }
        return queryString.toString();
    },

    // Décode une querystring sous la forme d'un objet :
    // "name=Truc+Muche&foo=bar"  ->  {"name": "Truc Muche", "foo": "bar"}
    decodeQueryString: function (string) {
        const params = {};
        const queryString = new URLSearchParams(string);
        for (let [paramName, value] of queryString) {
            params[paramName] = value;
        }
        return params;
    },

    // Récupère et décode les paramètres de l'URL
    getUrlParams: function () {
        return helpers.decodeQueryString(location.hash.slice(1));
    },

};


router.get('/login', (req, res) => {
    const params = {
        client_id: process.env.TWITCH_CLIENT_ID,
        redirect_uri: process.env.TWITCH_REDIRECT_URI,
        response_type: "code",
        scope: SCOPES.join(" "),
    };
    const queryString = helpers.encodeQueryString(params);

    const authenticationUrl = `https://id.twitch.tv/oauth2/authorize?${queryString}`;

    res.redirect(authenticationUrl);
});


router.get('/GetTwitchInformations',validateJWT, async (req, res) => {
    const TWITCH_INFORMATIONS = req.twitch_informations;
    if(req.twitch_informations === undefined){
        return res.send({connected : false});
    }

    const TWITCH_USER_DATA = TWITCH_INFORMATIONS.userInfos.data[0];
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

    TWITCH_USER_DATA.isAdmin = IsAdmin;
    res.send(TWITCH_INFORMATIONS);
});



// Endpoint de callback pour recevoir le "code" et échanger contre un access token
router.get('/callback', async (req, res) => {
    const authorizationCode = req.query.code;

    if (!authorizationCode) {
        return res.status(400).send('Code d\'autorisation manquant');
    }

    try {
        // Requête POST pour échanger le code contre un token d'accès
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                code: authorizationCode,
                grant_type: 'authorization_code',
                redirect_uri: process.env.TWITCH_REDIRECT_URI,
            },
        });

        const { access_token, expires_in } = response.data;
        const USER_VALUES = await getUserInfo(access_token);

        const userData = {
            id: USER_VALUES.data[0].id,   // l'ID utilisateur Twitch
            username: USER_VALUES.data[0].display_name,   // l'ID utilisateur Twitch
            logoTwitch: USER_VALUES.data[0].profile_image_url,   // l'ID utilisateur Twitch
            token: access_token, // Le token d'accès Twitch
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
        };

        const token = jwt.sign(userData, process.env.SECRET_JWT_KEY, { algorithm: 'HS256' });
 
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: false, // TODO en release => true 
            sameSite: 'Lax', // TODO en release => 'Strict'
            maxAge: 24 * 60 * 60 * 1000  // 24 heures  
        });

        //Redirection page principale
        res.redirect("/");

    } catch (error) {
        console.error('Erreur lors de l\'échange du code:', error);
        res.status(500).send('Erreur lors de l\'échange du code');
    }
});

// Middleware pour valider le JWT
async function validateJWT(req, res, next) {
    token = req.cookies.auth_token;

    if (!token) {
        // console.log("Utilisateur jamais connecté");
        req.isConnected = false;
        return next();
    }

    try {
        //JWT valide donc on vérifie si le token récupéré est valide
        const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
        req.user = decoded;
        const ISCONNECTED = await validateToken(decoded.token);
        const USER_INFOS = ISCONNECTED ? await getUserInfo(decoded.token) : null; 
        const TWITCH_INFORMATIONS = {
            connected : ISCONNECTED,
            userInfos : USER_INFOS
        }

        req.twitch_informations = TWITCH_INFORMATIONS; 
        return next();

    } catch (err) {
        req.isConnected = false;
        res.clearCookie('auth_token');
        // console.log("Le token est invalide ou expiré");
        return next();
    }
}


async function getUserInfo(user_access_token) {
    const url = 'https://api.twitch.tv/helix/users';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user_access_token}`,  // Ajouter le token dans les headers
                'Client-Id': process.env.TWITCH_CLIENT_ID  // Remplace par ton client_id
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur: ${response.status}`);
        }

        const data = await response.json();

        // Les infos utilisateurs sont dans data.data[0]
        return data;

    } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur :', error);
    }
}


async function validateToken(user_access_token) {
    try {
        const response = await axios.get('https://id.twitch.tv/oauth2/validate', {
            headers: {
                'Authorization': `Bearer ${user_access_token}`,
            },
        });
        //Token Valide
        return await true;
    } catch (error) {
        console.error('Token invalide:', error);
        return await false;
    }
}


module.exports = {
    validateJWT:validateJWT,
    router:router
}