// index.js
const visiteur = require('./Views/visiteur.html')
const express = require('express')
const axios = require('axios')
const nunjucks = require('nunjucks')


const app = express()
const PORT = 4000

app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

app.get('/', (req, res) => {
    res.send('Hey this is my API running 🥳')
})

app.get('/about', (req, res) => {
    const html = nunjucks.render(visiteur)
    res.send(html)
})




app.get('/connected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send('private. user:' + req.user.email)
})


// Export the Express API
module.exports = app