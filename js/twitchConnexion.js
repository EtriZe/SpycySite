// ID de l'application récupéré après l'avoir enregistrée
var USER_INFOS = "";
const CLIENT_ID = "faqe2p602algzgvkqn28xer64wagug";
var USER_ACCESS_TOKEN = "";
// Adresse où l'on veut que l'utilisateur soit redirigé après avoir autorisé
// l'application. Cette adresse DOIT être l'une de celles déclarées dans
// l'application sur dev.twitch.tv !!
const REDIRECT_URI = "http://localhost:3000/";

// Liste des éléments auxquels on souhaite accéder...  On reparlera de ça un
// peu plus tard ;)
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

// Fonctions liées à Twitch
const twitch = {

    // Vérifie si l'utilisateur est authentifié ou non
    isAuthenticated: function () {
        const params = helpers.getUrlParams();
        return params["access_token"] !== undefined;
    },

    // Redirige l'utilisateur sur la page d'authentification de Twitch avec les
    // bons paramètres
    authentication: function () {
        const params = {
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: "token",
            scope: SCOPES.join(" "),
        };
        const queryString = helpers.encodeQueryString(params);
        
        const authenticationUrl = `https://id.twitch.tv/oauth2/authorize?${queryString}`;
        location.href = authenticationUrl;
    },

};


// Fonction principale
function main() {
    // On lance l'authentification si l'utilisateur n'est pas authentifié
    if (!twitch.isAuthenticated()) {
        userNotConnected();
    } else {
        userConnected();
    }
}

const TWITCH_ICONE = '<img class="twitchIcone" src="icones/twitch-icon.svg"/>';

async function userConnected() {
    USER_INFOS = await getUserInfo();
    const TWITCH_CONNECTED_DIV = document.getElementById("twitchConnected");
    TWITCH_CONNECTED_DIV.innerHTML = USER_INFOS.data[0].display_name + TWITCH_ICONE;
    TWITCH_CONNECTED_DIV.title = "You are connected !";
    user_connected = true;
}

async function userNotConnected() {
    const TWITCH_CONNECTED_DIV = document.getElementById("twitchConnected");
    TWITCH_CONNECTED_DIV.innerHTML = "Not Connected";
    TWITCH_CONNECTED_DIV.title = "You are not connected !";
    user_connected = false;
    //On force la connexion
    twitch.authentication();
}

async function getUserInfo() {
    const url = 'https://api.twitch.tv/helix/users';
    const USER_ACCESS_TOKEN = helpers.getUrlParams()["access_token"];

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${USER_ACCESS_TOKEN}`,  // Ajouter le token dans les headers
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



// On appelle la fonction main() lorsque la page a fini de charger
window.onload = main;