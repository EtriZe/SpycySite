function setNewHTML(htmlFile, div){
    fetch(htmlFile).then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors du chargement du fichier');
            }
            return response.text();
        }).then(content => {
            div.innerHTML = content;
            return content;
        })
        .catch(error => {
            console.error('Erreur:', error);
            return false;
        });
}