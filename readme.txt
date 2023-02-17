
/*
*Cette route privé necessite d'être inscrit et connecté ce qui permet d'optenir un header jwt
*
*Elle prend en paramètre le nom d'un personnage et va chercher son id pour le supprimer dans la BDD
*/
DELETE ("https://nodejs-project-milhauj.vercel.app/deletepersonnage/:nom")
=>"unNom" => supprime le personnage si l'utilisateur est connecté



/*
*Cette route public renvoie tout les personnages présents dans la BDD
*
*/
GET("https://nodejs-project-milhauj.vercel.app/allpersonnage")
<= tableau de tout les personnages


/*
*Cette route public renvoie le perosnnage entier dont le nom est passé en parametre
*
*/
GET("https://nodejs-project-milhauj.vercel.app/personnage/:nompersonnage")
<= Personnage dont le nom est passe en parametre





/*
*Cette route permet d'ajouté ou de modifie un personnage si l'utilisateur est inscrit et connecté
*Le personnage sera créer si son nom n'est pas trouvé dans les personnages existans
*Le personnage sera modifier si son nom existe déja dans la base de données
*
*Elle demande en post un certain nombre de data
*/
POST("https://nodejs-project-milhauj.vercel.app/addElement")

Liste des parametre necessaire:

- nom
- description
- element
- model
- typeArme
- pv
- atq
- def
- tauxCrit
- dgtCrit
- dgtElement
- archon
- imgSrc

===> 

