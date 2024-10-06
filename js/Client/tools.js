function setNewHTML(htmlFileName, div) {
    fetch("html/" + htmlFileName + ".html").then(response => {
        if (!response.ok) throw new Error('Erreur lors du chargement du fichier');
        return response.text();
    }).then(content => {
        div.innerHTML = content;
        Load(htmlFileName);
        return content;
    }).catch(error => {
        console.error('Erreur:', error, "File Name : ", htmlFileName);
        return false;
    });
}


var scriptEle = document.createElement("script");
function loadJS(FILE_URL, async = true) {
    scriptEle.setAttribute("src", FILE_URL);
    scriptEle.setAttribute("type", "text/javascript");
    scriptEle.setAttribute("async", async);

    document.body.appendChild(scriptEle);

    // success event 
    scriptEle.addEventListener("load", () => {
        console.log("File loaded")
    });
    // error event
    scriptEle.addEventListener("error", (ev) => {
        console.log("Error on loading file", ev);
    });
}


function convertToEmbeddedLink(youtubeUrl) {
    // Utilisation d'une expression régulière pour extraire l'ID de la vidéo YouTube
    const videoIdMatch = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)?([^&\n?#]+)/)
        || youtubeUrl.match(/(?:https?:\/\/)?youtu\.be\/([^&\n?#]+)/);

    if (videoIdMatch && videoIdMatch[1]) {
        const videoId = videoIdMatch[1]; // Récupération de l'ID de la vidéo
        return `https://www.youtube.com/embed/${videoId}`; // Lien embedded
    } else {
        return false; // Retourne null si l'ID de la vidéo n'est pas trouvé
    }
}


function closeAllTabs() {
    document.querySelectorAll(".sousMenu").forEach(sousmenu => {
        sousmenu.style.display = "none";
    });
}


function openSousMenu(menu) {
    var sousMenu = menu.parentNode.querySelector(".sousMenu");
    if (sousMenu === null) return; // Pas de sous menu
    sousMenu.style.display = sousMenu.style.display === "none" ||
        sousMenu.style.display === ""
        ? "block" : "none";
    sousMenu.classList.toggle('show');
}

