// index.js

const express = require('express')
const app = express()

const axios = require('axios')

const passport = require('passport')
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const secret = 'thisismysecret'
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret
}


passport.use(
    new JwtStrategy(jwtOptions, async function(payload, next) {

        const listUser = await axios({
            method:"get",
            url: `https://nodemilhauj-3069.restdb.io/rest/utilisateurs`,
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

app.get('/', (req, res) => {
    res.send('Hello world!')
})




app.get('/personnage/:nompersonnage', async function (req, res){

    console.log("parametre:" + req.params.nompersonnage)

    const requestUnPersonnages = await axios({
        method:"get",
        url: `https://nodemilhauj-3069.restdb.io/rest/personnages`,
        headers:{
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
    });

    var result;
    for (const UnPersonnage of requestUnPersonnages.data) {
        console.log(UnPersonnage.nom)
        if (UnPersonnage.nom === req.params.nompersonnage){
            result = UnPersonnage;
        }
    }

    /*console.log(requestUnPersonnages.data[0].nom);
    console.log(requestUnPersonnages.data[1].nom);
    console.log(requestUnPersonnages.data[2].nom);
    console.log(requestUnPersonnages.data[3].nom);*/

    if (result == null){
        res.send('Le personnage demandé n\'existe pas')
    }else {
        res.send(result)
    }
})

app.get('/allpersonnage', async function (req, res){

    const requestPersonnages = await axios({
        method:"get",
        url: `https://nodemilhauj-3069.restdb.io/rest/personnages`,
        headers:{
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
    });

    console.log(requestPersonnages.data)

    for (const unPersonnage in requestPersonnages.data) {
        console.log(unPersonnage[1])
    }
    res.send(requestPersonnages.data)
})


app.get('/private', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send('private. user:' + req.user.email)
})


//PRIVATE ROUTES--------------------------------------------------------------------------------------------------------
app.post('/addElement', passport.authenticate('jwt', { session: false }), async function (req, res) {
    //res.send('private. user:' + req.user.email + ' on pourra ajoute un element ou en lodifie un deja cree')

    const nom = req.body.nom
    const element = req.body.element
    const model   = req.body.model
    const typeArme = req.body.typeArme
    const pv = req.body.pv
    const atq = req.body.atq
    const def = req.body.def
    const tauxCrit = req.body.tauxCrit
    const dgtCrit = req.body.dgtCrit
    const dgtElementaire = req.body.dgtElementaire
    console.log(nom + " " + element + " " + model + " " + typeArme + " " + pv + " " + atq + " " + def + " " + tauxCrit + " "+ dgtCrit + " " + dgtElementaire)
    if (!nom || !element|| !model || !typeArme|| !pv|| !atq|| !def|| !tauxCrit|| !dgtCrit || !dgtElementaire) {
        res.status(401).json({ error: 'Un des élements à pas été renseigné.' })
        return
    }

    const requestListePersonnage = await axios({
        method:"get",
        url: `https://nodemilhauj-3069.restdb.io/rest/personnages`,
        headers:{
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
    });

    var allpersonnage =[]
    for (const personnage of requestListePersonnage.data) {
        allpersonnage.push({nom: personnage.nom})
        console.log(personnage.nom)
    }


    const rechercheperso = allpersonnage.find(rechercheperso => rechercheperso.nom === nom)
    console.log("Personnage recherche:"+ nom + "resultat: " + rechercheperso)
    const personnage = {
        nom: nom,
        element: element,
        model: model,
        typeArme: typeArme,
        pv: pv,
        atq: atq,
        def: def,
        tauxCrit: tauxCrit,
        dgtCrit: dgtCrit,
        dgtElementaire: dgtElementaire
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
        await axios({
            method:"put",
            url: `https://nodemilhauj-3069.restdb.io/rest/personnages`,
            data:personnage,
            headers:{
                "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
            },
        });
        res.send('Le personnage à été modifié')
    }
})





app.post('/inscription', async function (req, res){
    const email = req.body.email
    const pseudo = req.body.pseudo
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword

    if (!email || !password || !pseudo || !confirmPassword) {
        res.status(401).json({ error: 'Email, password,pseudo or password confirmation was not provided.' })
        return
    }else if (password !== confirmPassword){
        res.status(401).json({ error: 'The password and the confirmation password are different.' })
        return
    }

    const utilisateur = {
        email: email,
        pseudo: pseudo,
        password: password
    };

    const listeUser = await axios({
        method:"get",
        url: `https://nodemilhauj-3069.restdb.io/rest/utilisateurs`,
        headers:{
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
    });

    /*for(const user of listeUser.data) {
        console.log(user.email)
        if (email === user.email){
            res.send('email déjà utilisé')
        }
    }*/

    await axios({
        method:"post",
        url: `https://nodemilhauj-3069.restdb.io/rest/utilisateurs`,
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

    const response1 = await axios({
        method:"get",
        url: `https://nodemilhauj-3069.restdb.io/rest/utilisateurs`,
        headers:{
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
    });

    var users =[]
    for (const response1Element of response1.data) {
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

    if (!user || user.password !== password) {
        res.status(401).json({ error: 'Email / password do not match.' })
        return
    }

    const userJwt = jwt.sign({ email: user.email }, secret)

    res.json({ jwt: userJwt })
})
//------------------------------------------------------------------------------------------------------------------



app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})
