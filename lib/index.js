require('dotenv').config()
const app = require('./app')
const build = require('./build')

const port = process.env.PORT || 3000

build.init()
app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
