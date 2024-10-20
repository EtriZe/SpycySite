let ISUSERADMIN = false;

function Load(HTMLFileName) {
    switch (HTMLFileName) {
        case "home":
            loadHome();
            break;
        case "musicsGalerie":
            handlingPagesMusics();
            loadMusicGalerie(1);
            break;
        case "musicsProposal":
            loadMusicProposal();
            break;
        case "cardsOpening":
            loadCardsOpening();
            break;
        case "cardsCollection":
            loadCardsCollection();
            break;

    }
}

function handlingPagesMusics(){
    const RIGHT_PAGE = document.querySelector("#page-after");
    RIGHT_PAGE.addEventListener("click", function(e){
        const PAGE = document.querySelector("#page-number");
        const PAGE_VALUE = parseInt(PAGE.innerHTML);
        let newPage = PAGE_VALUE + 1;
        //PAGE.innerHTML = newPage;
        loadMusicGalerie(newPage);
    });

    const LEFT_PAGES = document.querySelector("#page-before");
    LEFT_PAGES.addEventListener("click", function(e){
        const PAGE = document.querySelector("#page-number");
        const PAGE_VALUE = parseInt(PAGE.innerHTML);
        let newPage = PAGE_VALUE === 1 ? 1 : PAGE_VALUE - 1;
        //PAGE.innerHTML = newPage;
        loadMusicGalerie(newPage);
    });

    const SEARCHPSEUDO = document.querySelector(".pseudoSearch-input");
    SEARCHPSEUDO.addEventListener("keyup", function(e){
        //On search on revient page 1
        loadMusicGalerie(1);
    });
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


function loadMusicGalerie(page_number) {

    let pseudoSearchValue = document.querySelector(".pseudoSearch-input").value === "" ? "0" : document.querySelector(".pseudoSearch-input").value;
    fetch('/musics/GET/'+ page_number + '/' + pseudoSearchValue).then(response => response.json()).then(data => {

        if(data.length !== 0) {
            document.querySelector("#page-number").innerHTML = page_number;
        }

        if(page_number !== "0", data.length === 0){
            return;
        }

        let urls = data.map(musiques => convertToEmbeddedLink(`${musiques.url}`));
        let pseudos = data.map(musiques => `${musiques.twitchname}`);
        let isLikeds = data.map(musiques => `${musiques.liked}`);
        let ids = data.map(musiques => `${musiques.idmusic}`);

       
        document.getElementById("content").innerHTML = '';
        urls.forEach(function(element, key){ // Element exemple : https://www.youtube.com/embed/vm58qGBpDuU
            let srcIconeLike = isLikeds[key] === "true" ? 'icones/fullHeart.svg' : 'icones/emptyHeart.svg'
            // Extraire la partie de la chaîne après le dernier "/"
            const videoId = element.substring(element.lastIndexOf("/") + 1);
            
            //Boutons autorisé que pour l'admin
            let htmlLikeButton = "<img class='favIcone' music-id='"+ids[key]+"' src='"+srcIconeLike+"'/>";

            const divVideo = "<div class='youtube-container-galerie'><lite-youtube videoid='" + videoId + "' params='controls=1'></lite-youtube><div class='youtube-galerie-informations'><div class='pseudo-galerie'>"+pseudos[key]+"</div>"+htmlLikeButton+"</div></div>";
            if (element === "") return;
            document.getElementById("content").innerHTML += divVideo;
        });
    }).catch(
        error => console.error('Error occurred:', error)
    ).finally(() => {
        if(ISUSERADMIN) addLogicFavButtons();
    }); 
}


function addLogicFavButtons(){
    let likedButtons = document.querySelectorAll(".favIcone");
    likedButtons.forEach((likeButton) => {
        likeButton.addEventListener("click", function(e){
            if(likeButton.src.includes("empty")){
                likeButton.src = "icones/fullHeart.svg";
                setFavorite("true", likeButton.getAttribute("music-id"));
            }else{
                likeButton.src = "icones/emptyHeart.svg";
                setFavorite("false", likeButton.getAttribute("music-id"));
            }
        });
    });
}

async function setFavorite(isLiked, idValue){

    const isLikedData = {
        isLiked : isLiked,
        idValue : idValue
    };
    
    var result = await fetch('/musics/LIKE', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(isLikedData)
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

function loadCardsCollection(){

}

const TWITCH_ICONE = '<img class="twitchIcone" src="icones/twitch-icon.svg"/>';

//To change interface if user is connected or not
async function connectUSER() {
    const TWITCH_CONNECTION = await amIConnected();
    if (TWITCH_CONNECTION.connected) {
        const USER_INFOS = TWITCH_CONNECTION.userInfos;
        ISUSERADMIN = USER_INFOS.data[0].isAdmin;
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

