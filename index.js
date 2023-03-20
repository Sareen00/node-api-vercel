// index.js

const express = require('express')
const app = express()


const cors = require('cors')
const axios = require('axios')

const passport = require('passport')
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const secret = 'thisismysecret'
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

app.use(cors())


const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret
}

const urlpersonnage = "https://nodemilhauj-3069.restdb.io/rest/personnages"
const urlutlisateur = "https://nodemilhauj-3069.restdb.io/rest/utilisateurs"

passport.use(
    new JwtStrategy(jwtOptions, async function(payload, next) {

        const listUser = await axios({
            method:"get",
            url: urlutlisateur,
            headers:{
                "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
            },
        });

        var users =[]
        for (const user of listUser.data) {
            console.log(user.email)
            users.push({email: user.email})
        }
        console.log(users)

        const user = users.find(user => user.email === payload.email)

        if (user) {
            next(null, user)
        } else {
            next(null, false)
        }
    })
)

app.use(passport.initialize())
app.use(express.json())


async function getAllPersonnages() {
    try {
      const response = await axios.get(urlpersonnage, {
        headers: {
          "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
      });
  
      return response.data;
    } catch (error) {
      console.error("Error while getting all personnages:", error);
      throw error;
    }
}


async function getPersonnageByName(nomPersonnageRetourne) {
    const dataAllPersonnages = await getAllPersonnages();
    const result = dataAllPersonnages.find(personnage => personnage.nom === nomPersonnageRetourne);
  
    if (!result) {
      return null;
    }
  
    return result;
}



async function getIdPersonnageByName(nomPersonnageRetourne) {
  const allPersonnages = await getAllPersonnages();
  for (const personnage of allPersonnages) {
    if (personnage.nom === nomPersonnageRetourne) {
      return personnage._id;
    }
  }
  return null;
}

async function getAllUtilisateurs() {
    const response = await axios.get(urlutlisateur, {
      headers: { "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef" },
    });
    return response.data;
  }

app.get('/', (req, res) => {
    res.send('Bienvenu sur l\'application de comparaison!')
})


app.get('/personnage/:nompersonnage', async function (req, res) {
    try {
      const nomPersonnage = req.params.nompersonnage;
      const personnage = await getPersonnageByName(nomPersonnage);
      if (personnage) {
        res.send(personnage);
      } else {
        res.status(404).send(`Le personnage ${nomPersonnage} n'existe pas.`);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Erreur lors de la récupération du personnage.");
    }
  });
  



  app.get('/allpersonnage', async function (req, res){
    try {
        const dataAllPersonnages = await getAllPersonnages();
        res.send(dataAllPersonnages);
    } catch (error) {
        console.error("Error while getting all personnages:", error);
        res.status(500).send("Internal Server Error");
    }
});



//PRIVATE ROUTES--------------------------------------------------------------------------------------------------------
app.post('/addpersonnage', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      const { nom, description, element, model, typeArme, pv, dgt, def, tauxCrit, dgtCrit, dgtElementaire, archon, imgSrc } = req.body;
  
      // Vérifie si tous les éléments nécessaires pour l'injection dans la BDD ont été renseignés
      if (!nom || !description || !element || !model || !typeArme || !pv || !dgt || !def || !tauxCrit || !dgtCrit || !dgtElementaire || !archon || !imgSrc) {
        return res.status(401).json({ error: 'Un des éléments n\'a pas été renseigné.' });
      }
  
      // Récupère tous les personnages de la BDD pour vérifier s'ils existent déjà
      const listePersonnage = await getAllPersonnages();
      const isExistingPersonnage = listePersonnage.some(personnage => personnage.nom === nom);
  
      if (!isExistingPersonnage) {
        await axios({
          method: "post",
          url: urlpersonnage,
          data: {
            nom,
            description,
            element,
            model,
            typeArme,
            pv,
            dgt,
            def,
            tauxCrit,
            dgtCrit,
            dgtElementaire,
            archon,
            imgSrc
          },
          headers: {
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
          },
        });
        return res.send('Le personnage a été ajouté.');
      } else {
        // Récupère l'id du personnage à modifier
        const idPersonnageASupprimer = await getIdPersonnageByName(nom);
        const urlPersonnageAsupprimer = urlpersonnage + "/" + idPersonnageASupprimer;
  
        await axios({
          method: "put",
          url: urlPersonnageAsupprimer,
          data: {
            nom,
            description,
            element,
            model,
            typeArme,
            pv,
            dgt,
            def,
            tauxCrit,
            dgtCrit,
            dgtElementaire,
            archon,
            imgSrc
          },
          headers: {
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
          },
        });
        return res.send('Le personnage a été modifié.');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur serveur.');
    }
  });
  



app.delete('/deletePersonnage/:nompersonnageasupprimer', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
        // Récupération du nom du personnage à supprimer depuis les paramètres de l'URL
        const nomPersonnageASupprimer = req.params.nompersonnageasupprimer;

        // Récupération de l'ID du personnage à supprimer à partir de son nom
        const idPersonnageASupprimer = await getIdPersonnageByName(nomPersonnageASupprimer);

        // Vérification que le personnage existe dans la base de données
        if (idPersonnageASupprimer === false){
            return res.status(404).send('Le personnage ' + nomPersonnageASupprimer + ' n\'existe pas');
        }

        // Construction de l'URL de la requête DELETE à partir de l'ID du personnage
        const urlADelete = urlpersonnage + "/" + idPersonnageASupprimer;

        // Envoi de la requête DELETE à l'API pour supprimer le personnage
        await axios({
            method:"delete",
            url: urlADelete,
            headers:{
                "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
            },
        });

        // Retour d'une réponse indiquant que le personnage a bien été supprimé
        return res.send('Le personnage ' + nomPersonnageASupprimer + ' a été supprimé');
    } catch (error) {
        // Gestion des erreurs en renvoyant une réponse avec le code d'erreur approprié
        console.error(error);
        return res.status(500).send('Une erreur est survenue lors de la suppression du personnage');
    }
});






app.post('/inscription', async function (req, res){
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword

    if (!email || !password || !confirmPassword) {
        res.status(401).json({ error: 'Email, password, ou confirmPassword non renseigné.' })
        return
    } else if (password !== confirmPassword){
        res.status(401).json({ error: 'Le password  et le confirmPassword sont différents.' })
        return
    }

    const utilisateur = {
        email: email,
        password: password
    };

    const listeUser = await getAllUtilisateurs()
    console.log("Voila dans quoi on verifie les email: " + listeUser)
    for(const user of listeUser) {
        console.log(user.email)
        if (email === user.email){
            res.status(401).json({ error: 'Email déjà utilisé.' })
            return // ajout de return ici pour éviter l'envoi de plusieurs réponses
        }
    }

    await axios({
        method:"post",
        url: urlutlisateur,
        data:utilisateur,
        headers:{
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
    });

    res.send('Bravo vous êtes inscrit. Connectez vous ici (email et password> /connexion')
})




app.post('/connexion', async function (req, res) {

    const email = req.body.email
    const password = req.body.password

    if (!email || !password) {
        res.status(401).json({ error: 'Email ou password non renseigné.' })
        return
    }


    const response1 = await getAllUtilisateurs()
    console.log(response1)

    var users =[]
    for (const response1Element of response1) {
        console.log(response1Element.email)
        users.push({email: response1Element.email, password: response1Element.password})
    }
    console.log(users)


    const user = users.find(user => user.email === email)
    if (!user){
        res.status(401).json({ error: 'Utilisateur inconnu il faut être inscrit.' })
        return
    }else if(user.password !== password){
        res.status(401).json({ error: 'Email / password ne correspondent pas.' })
        return
    }

    const userJwt = jwt.sign({ email: user.email }, secret)

    res.json({ jwt: userJwt })
})
//------------------------------------------------------------------------------------------------------------------



app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})
