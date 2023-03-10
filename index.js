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


async function getAllPersonnages(){
    const requestAllPersonnages = await axios({
        method:"get",
        url: urlpersonnage,
        headers:{
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
    });
    return requestAllPersonnages.data;
}
async function getPersonnageByName(nomPersonnageRetourne){
    const DataAllPersonnages = await getAllPersonnages();
    var result
    for (const UnPersonnage of DataAllPersonnages) {
        if (UnPersonnage.nom === nomPersonnageRetourne){
            result = UnPersonnage;
        }
    }
    if (result==null){
        res.send('Le personnage demandé n\'existe pas')
    }else{
        return result
    }
}
async function getIdPersonnageByName(nomPersonnageRetourne){
    const DataAllPersonnages = await getAllPersonnages();
    for (const UnPersonnage of DataAllPersonnages) {
        if (UnPersonnage.nom === nomPersonnageRetourne) {
            return UnPersonnage._id;
        }
    }
    return false;
}
async function getAllUtilisateurs(){
    const requestAllUtilisateurs= await axios({
        method:"get",
        url: urlutlisateur,
        headers:{
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
    });
    return requestAllUtilisateurs.data;
}



app.get('/', (req, res) => {
    res.send('Bienvenu sur l\'application de comparaison!')
})


// app.delete("/deletepersonnage/:nom",async function (req, res){
//     await console.log(req.params.nom)
//     const idPersonnageASupprimer = await getIdPersonnageByName(req.params.nom)
//     await console.log(idPersonnageASupprimer)
//
//     if (idPersonnageASupprimer === false){
//         res.send('Le personnage ' + req.params.nom + ' n\'existe pas')
//     }else {
//         urlADelete = urlpersonnage + "/" + idPersonnageASupprimer
//         console.log(urlADelete)
//         await axios({
//             method:"delete",
//             url: urlADelete,
//             headers:{
//                 "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
//             },
//         });
//     }
// })



app.get('/personnage/:nompersonnage', async function (req, res){
    var result = await getPersonnageByName(req.params.nompersonnage)
    if (result == null){
        res.send('Le personnage demandé n\'existe pas')
    }else {
        res.send(result)
    }
})



app.get('/allpersonnage', async function (req, res){
    const dataAllPersonnages = await getAllPersonnages()
    res.send(dataAllPersonnages)
})


//PRIVATE ROUTES--------------------------------------------------------------------------------------------------------
app.post('/addpersonnage', passport.authenticate('jwt', { session: false }), async function (req, res) {
    //res.send('private. user:' + req.user.email + ' on pourra ajoute un element ou en lodifie un deja cree')

    const nom = req.body.nom
    const description = req.body.description
    const element = req.body.element
    const model   = req.body.model
    const typeArme = req.body.typeArme
    const pv = req.body.pv
    const dgt = req.body.dgt
    const def = req.body.def
    const tauxCrit = req.body.tauxCrit
    const dgtCrit = req.body.dgtCrit
    const dgtElementaire = req.body.dgtElementaire
    const archon = req.body.archon
    const imgSrc = req.body.imgSrc



    //Vérifie si tout les element necessaire pour l'injection dans la bdd on était renseigné
    console.log(nom + " " + element + " " + model + " " + typeArme + " " + pv + " " + dgt + " " + def + " " + tauxCrit + " "+ dgtCrit + " " + dgtElementaire + " " + imgSrc)
    if (!nom || !description || !element || !model || !typeArme|| !pv|| !dgt || !def|| !tauxCrit|| !dgtCrit || !dgtElementaire || !archon || !imgSrc) {
        res.status(401).json({ error: 'Un des élements à pas été renseigné.' })
        return
    }

    //Récupère tout les personnages de la bdd pour vérifié si il existe déjà
    const ListePersonnage = await getAllPersonnages()

    var allpersonnage =[]
    for (const personnage of ListePersonnage) {
        allpersonnage.push({nom: personnage.nom})
        console.log(personnage.nom)
    }


    const rechercheperso = allpersonnage.find(rechercheperso => rechercheperso.nom === nom)
    await console.log("Personnage recherche:"+ nom + " resultat: " + rechercheperso)
    const personnage = {
        nom: nom,
        description: description,
        element: element,
        model: model,
        typeArme: typeArme,
        pv: pv,
        dgt: dgt,
        def: def,
        tauxCrit: tauxCrit,
        dgtCrit: dgtCrit,
        dgtElementaire: dgtElementaire,
        archon: archon,
        imgSrc: imgSrc
    };


    if (!rechercheperso){
        await axios({
            method:"post",
            url: `https://nodemilhauj-3069.restdb.io/rest/personnages`,
            data:personnage,
            headers:{
                "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
            },
        });
        res.send('Le personnage à été ajouté')
    }else {
        //TODO A VERIFIER
        idPersonnageASupprime = await getIdPersonnageByName(nom);
        var urlPersonnageAsupprimer = urlpersonnage + "/" + idPersonnageASupprime
        console.log("Url a supprime : " + idPersonnageASupprime)
        await axios({
            method:"put",
            url: urlPersonnageAsupprimer,
            data:personnage,
            headers:{
                "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
            },
        });
        res.send('Le personnage à été modifié')
    }
})


app.delete('/deletePersonnage/:nompersonnageasupprimer', passport.authenticate('jwt', { session: false }), async function (req, res) {
    //res.send('private. user:' + req.user.email + ' on pourra ajoute un element ou en lodifie un deja cree')

    await console.log(req.params.nompersonnageasupprimer)
    const idPersonnageASupprimer = await getIdPersonnageByName(req.params.nompersonnageasupprimer)
    await console.log(idPersonnageASupprimer)

    if (idPersonnageASupprimer === false){
        res.send('Le personnage ' + req.params.nom + ' n\'existe pas')
    }else {
        urlADelete = urlpersonnage + "/" + idPersonnageASupprimer
        console.log(urlADelete)
        await axios({
            method:"delete",
            url: urlADelete,
            headers:{
                "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
            },
        });
        res.send('Le personnage à été supprimé')
    }
})





app.post('/inscription', async function (req, res){
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword

    if (!email || !password || !confirmPassword) {
        res.status(401).json({ error: 'Email, password, or password confirmation was not provided.' })
        return
    }else if (password !== confirmPassword){
        res.status(401).json({ error: 'The password and the confirmation password are different.' })
        return
    }

    const utilisateur = {
        email: email,
        password: password
    };

    // const listeUser = await axios({
    //     method:"get",
    //     url: `https://nodemilhauj-3069.restdb.io/rest/utilisateurs`,
    //     headers:{
    //         "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
    //     },
    // });

    const listeUser = await getAllUtilisateurs()

    /*for(const user of listeUser.data) {
        console.log(user.email)
        if (email === user.email){
            res.send('email déjà utilisé')
        }
    }*/

    await axios({
        method:"post",
        url: urlutlisateur,
        data:utilisateur,
        headers:{
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
    });
    //const afficheInfo = await console.log(email,pseudo,password,confirmPassword)
    res.send('Bravo vous êtes inscrit. Connectez vous ici (email et password> /connexion')
})



app.post('/connexion', async function (req, res) {

    const email = req.body.email
    const password = req.body.password

    if (!email || !password) {
        res.status(401).json({ error: 'Email or password was not provided.' })
        return
    }

    // const response1 = await axios({
    //     method:"get",
    //     url: `https://nodemilhauj-3069.restdb.io/rest/utilisateurs`,
    //     headers:{
    //         "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
    //     },
    // });

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
        res.status(401).json({ error: 'Email / password do not match.' })
        return
    }

    // if (!user || user.password !== password) {
    //     res.status(401).json({ error: 'Email / password do not match.' })
    //     return
    // }

    const userJwt = jwt.sign({ email: user.email }, secret)

    res.json({ jwt: userJwt })
})
//------------------------------------------------------------------------------------------------------------------



app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})
