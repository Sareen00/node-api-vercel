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
    const html = nunjucks.render('./views/visiteur.html',{})
    res.send(html)
    //res.send('you ae on the about root')

})

app.get('/private', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send('private. user:' + req.user.email)
})


// Export the Express API
module.exports = app