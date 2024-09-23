19/09/2024 ----------------------------------------------------------------------------------------------------------------

Première affichage qui permet de tester la connexion postgresql avec nodejs express.
Cela affiche juste des urls stocké dans ma table "musics" et les convertis en version "embeded" pour que ce soit affichable:
![image](https://github.com/user-attachments/assets/ee4e6a0d-1ed0-44a0-ad0b-25bad2464de9)

22/09/2024 ----------------------------------------------------------------------------------------------------------------

Design modifié mais clairement pas fini. Et logique de changement du contenu qu'on souhaite affiché. (Cela va chercher le contenu du fichier HTML demandé pour l'ajouter dans le contenu (exemple : musicsGalerie.html)
![2024-09-2218-50-15-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/eed9f473-99a0-457e-b693-68f23d4a5546)

24/09/2024 ----------------------------------------------------------------------------------------------------------------

Onglet "propositions" fonctionnel. Permet de push l'url de musique que l'on met.
Il faut désormais ajouté une sécurité : si c'est pas un lien youtube on exécute pas la requête.
