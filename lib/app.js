const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.static('dist/'))

app.get('/api/', (req, res, next) => res.send('hello'))

module.exports = app
