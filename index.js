// index.js
const express = require('express')
const app = express()
const PORT = 4000

const axios = require('axios')
const nunjucks = require('nunjucks')

const passport = require('passport')
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const secret = 'secretsentence'
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret
}

const users = [{ email: 'pcavalet@kaliop.com', password: 'kaliop' }]


passport.use(
    new JwtStrategy(jwtOptions, function(payload, next) {
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




app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

app.get('/', (req, res) => {
    res.send('Hey this is my API running 🥳')
})

app.get('/about', (req, res) => {
    res.send('you ae on the about route')

})


//PRIVATE ROUTES
app.get('/addElement', passport.authenticate('jwt', { session: false }), async function (req, res) {
    res.send('private. user:' + req.user.email + ' on pourra ajoute un element ou en lodifie un deja cree')

    await axios({
        method:"post",
        url: `https://nodemilhauj-3069.restdb.io/rest/utilisateurs`,
        data:utilisateur,
        headers:{
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
    });

})

app.get('/deleteElement', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send('private. user:' + req.user.email)
})



//PUBLIC ROOTS
app.get('/element', (req, res) => {
    res.send('On va selectionne un produit')
    //CCHERCHE Si element existe
    //donne element

    //res.send('you ae on the about root')

})

app.get('/allelements', (req, res) => {
    res.send('On va selectionne tout les produits produit')
    //Chercher tout les elements
})

app.get('/util', async function (req, res){
    const response1 = await axios({
        method:"get",
        url: `https://nodemilhauj-3069.restdb.io/rest/utilisateurs`,
        headers:{
            "x-apikey": "aac82f5b135ec774843b7536945f64f4f57ef",
        },
    });

    //console.log(response1.data)

    var users =[]
    for (const response1Element of response1.data) {
        console.log(response1Element.email)
        tablogin.push({email: response1Element.email, password: response1Element.password})
    }
    console.log(tablogin)


    const user = users.find(user => user.email === email)
    if (!user){
        res.status(401).json({ error: 'Utilisateur inconnu il faut être inscrit.' })
        return
    }else if(user.password !== password){
        res.status(401).json({ error: 'Email / password do not match.' })
        return
    }


    /*console.log(response1.data[0].email)
    console.log(response1.data[1].email)
    console.log(response1.data[2].email)*/
    

    //console.log(response1.data)
    res.send('bravo')
})



//POST ROUTES
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

    console.log(req.body.email)
    console.log(req.body.password)

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

    //console.log(response1.data)

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
    res.json({ jwt: userJwt, ajout: '/addelement',suppression: '/deleteelement'})
})


// Export the Express API
module.exports = app