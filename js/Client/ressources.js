function loadMusicGalerie() {
    fetch('/musicsGalerie').then(response => response.json()).then(data => {
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

function loadMusicProposal() {
    var input = document.getElementById("inputProposal");
    var videoIframe = document.getElementById("apercuVideo");

    input.addEventListener("change", (event) => {
        videoIframe.src = convertToEmbeddedLink(input.value);
    });


    var btnProposer = document.getElementById("btnProposer");
    btnProposer.addEventListener("click", (event) => {
        insertNewMusic(input.value);
    });
}

//INSERT new song by youtube url
function insertNewMusic(urlParameter) {
    if (!user_connected) {
        console.log("User not connected !");
        return;
    }

    const musicData = {
        pseudo: USER_INFOS.data[0].display_name,
        url: convertToEmbeddedLink(urlParameter)
    };

    fetch('/insertNewMusic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(musicData)
    })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
            btnProposerSuccess();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
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

function btnProposerSuccess() {

}

const TWITCH_ICONE = '<img class="twitchIcone" src="icones/twitch-icon.svg"/>';

//To change interface if user is connected or not
async function loadConnected() {
    const TWITCH_CONNECTION = await amIConnected();
    if(TWITCH_CONNECTION.connected){
        const USER_INFOS = TWITCH_CONNECTION.userInfos;
        const TWITCH_CONNECTED_DIV = document.getElementById("twitchConnected");
        TWITCH_CONNECTED_DIV.innerHTML = USER_INFOS.data[0].display_name + TWITCH_ICONE;
        TWITCH_CONNECTED_DIV.title = "You are connected !";
    }else{
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
async function amIConnected(){
    return await fetch('/IsClientConnected').then(response => response.json()).then(data => {
        return data;
    }).catch(
        error => console.error('Error occurred:', error)
    );
}