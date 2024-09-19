fetch('/Musiques').then(response => response.json()).then(data => { 
        const urls = data.map( musiques => convertToEmbeddedLink(`${musiques.url}`));
        console.log(urls);
        urls.forEach((element) =>{
            const divVideo = "<div><iframe width='458vw' height='246vh' src='" + element + "' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe></div>";
            if(element === "") return;
            document.getElementById("content").innerHTML += divVideo;
        });
    }).catch(
        error => console.error('Error occurred:', error)
); 


function convertToEmbeddedLink(youtubeUrl) {
    // Utilisation d'une expression régulière pour extraire l'ID de la vidéo YouTube
    const videoIdMatch = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)?([^&\n?#]+)/) 
                        || youtubeUrl.match(/(?:https?:\/\/)?youtu\.be\/([^&\n?#]+)/);
    
    if (videoIdMatch && videoIdMatch[1]) {
        const videoId = videoIdMatch[1]; // Récupération de l'ID de la vidéo
        return `https://www.youtube.com/embed/${videoId}`; // Lien embedded
    } else {
        return ""; // Retourne null si l'ID de la vidéo n'est pas trouvé
    }
}