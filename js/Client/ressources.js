function Load(HTMLFileName) {
    switch (HTMLFileName) {
        case "home":
            loadHome();
            break;
        case "musicsGalerie":
            loadMusicGalerie();
            break;
        case "musicsProposal":
            loadMusicProposal();
            break;
        case "artGalerie":
            loadArtGalerie();
            break;
        case "artProposal":
            loadArtProposal();
            break;
        case "cardCollection":
            loadCardCollection();
            break;

    }
}


async function loadMusicProposal() {
    var input = document.getElementById("inputProposal");
    var videoIframe = document.getElementById("apercuVideo");

    input.addEventListener("change", (event) => {
        videoIframe.src = convertToEmbeddedLink(input.value);
    });

    var btnProposer = document.getElementById("btnProposer");
    btnProposer.addEventListener("click", () => btnProposerEvent(input.value), false);      
}

async function btnProposerEvent(valueInput){
    var response = await insertNewMusic(valueInput);
    btnProposerFeedback(btnProposer, response);
}


var can_propose_music = true;
async function btnProposerFeedback(btn, response) {
    // const TWITCH_CONNECTION = await amIConnected();
    var oldBackground = btn.style.backgroundColor;
    var oldText = btn.innerHTML;
    var oldWidth = btn.style.width;
    var delayBeforeComeBack = 2000;
    btn.style.width = "100%";

    if(response.status !== 201){
        btn.style.backgroundColor = 'red';
        btn.innerHTML = response.message;
    }else{
        btn.innerHTML = "Envoi réussi";
        can_propose_music = false;
    }

    setTimeout(function () {
        btn.innerHTML = oldText;
        btn.style.width = oldWidth
        btn.style.backgroundColor = oldBackground;
        can_propose_music = true;
       //s'éxecute au bout de 2 secondes
    }, delayBeforeComeBack);

}


function loadMusicGalerie() {
    fetch('/musics/GET').then(response => response.json()).then(data => {
        const urls = data.map(musiques => convertToEmbeddedLink(`${musiques.url}`));
        urls.forEach((element) => {
            const divVideo = "<div><iframe class='videoYoutube' src='" + element + "' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe></div>";
            if (element === "") return;
            document.getElementById("content").innerHTML += divVideo;
        });
    }).catch(
        error => console.error('Error occurred:', error)
    );
}


//INSERT new song by youtube url
async function insertNewMusic(urlParameter) {

    const url = convertToEmbeddedLink(urlParameter);
    if(!url) {
        return "Il y a une erreur avec ce lien";
    }

    const musicData = {
        url: url
    };

    var result = await fetch('/musics/INSERT', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(musicData)
    }).then(response => {
        return {
            status : response.status,
            message: response.statusText
        };
    }).catch((error) => {
        console.error('Error:', error);
    });   
    
    return result;
}


function loadHome() {
    console.log("Load Home");
}

function loadArtProposal() {
    console.log("Load Art Proposal");
}

function loadArtGalerie() {
    console.log("Load Art Galerie");
}

function loadCardCollection() {
    console.log("Load Card Collection");
}

const TWITCH_ICONE = '<img class="twitchIcone" src="icones/twitch-icon.svg"/>';

//To change interface if user is connected or not
async function connectUSER() {
    const TWITCH_CONNECTION = await amIConnected();
    if (TWITCH_CONNECTION.connected) {
        const USER_INFOS = TWITCH_CONNECTION.userInfos;
        const TWITCH_CONNECTED_DIV = document.getElementById("twitchConnected");
        TWITCH_CONNECTED_DIV.innerHTML = USER_INFOS.data[0].display_name + TWITCH_ICONE;
        TWITCH_CONNECTED_DIV.title = "You are connected !";
    } else {
        console.log("Not connected to Twitch !");
    }
}

/*
data format => {
    connected : true or false,
    userInfos : (objet with twitch user informations)
}
*/
//To know if user is connected
async function amIConnected() {
    return await fetch('/twitch/GetTwitchInformations').then(response => response.json()).then(data => {
        return data;
    }).catch(
        error => console.error('Error occurred:', error)
    );
}