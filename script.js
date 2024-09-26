// Import required modules 
const express = require('express'); 
const { Pool } = require('pg'); 
const path = require('path'); 
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express(); // Connect and Create an Express Application 
const port = 3000; // By default, its 3000, you can customize
var user_values = "";
var user_connected = false;

//TWITCH ------------------
const CLIENT_ID = "0cqurfdhweix90jlix81jljg9sfh77";
const REDIRECT_URI = "http://localhost:3000/callback";
const CLIENT_SECRET = "79gh51ghdkcpl5rpzi10j7cba3pqfr";
const SCOPES = ["user_read"];

// Diverses fonctions utilitaires
const helpers = {
    // Encode un objet sous forme d'une querystring utilisable dans une URL :
    // {"name": "Truc Muche", "foo": "bar"}  ->  "name=Truc+Muche&foo=bar"
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



app.get('/login', (req, res) => {
    const params = {
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: SCOPES.join(" "),
    };
    const queryString = helpers.encodeQueryString(params);
    
    const authenticationUrl = `https://id.twitch.tv/oauth2/authorize?${queryString}`;
   
    res.redirect(authenticationUrl);
});



app.get('/userInfos', async (req, res) => {
    res.send(user_values);
});



// Endpoint de callback pour recevoir le "code" et échanger contre un access token
app.get('/callback', async (req, res) => {
    const authorizationCode = req.query.code;

    if (!authorizationCode) {
        return res.status(400).send('Code d\'autorisation manquant');
    }

    try {
        // Requête POST pour échanger le code contre un token d'accès
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: authorizationCode,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
            },
        });

        const { access_token, refresh_token, expires_in } = response.data;
        user_values = await getUserInfo(access_token);

        //Redirection page principale
        res.redirect("/");

    } catch (error) {
        console.error('Erreur lors de l\'échange du code:', error);
        res.status(500).send('Erreur lors de l\'échange du code');
    }
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
    const { pseudo, url } = req.body;

    // Vérifier si les champs requis sont présents
    if (!url) {
        return res.status(400).send('Field URL is required.');
    }

    // Créer la requête SQL d'insertion
    // const query = "INSERT INTO musics VALUES ('EtriZe',$1)";
    const query = "INSERT INTO musics(twitchName, url) VALUES($1,$2);";

    // Exécuter la requête avec les valeurs fournies
    pool.query(query, [pseudo, url], (error, result) => {
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

async function getUserInfo(user_access_token) {
    const url = 'https://api.twitch.tv/helix/users';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user_access_token}`,  // Ajouter le token dans les headers
                'Client-Id': CLIENT_ID  // Remplace par ton client_id
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
