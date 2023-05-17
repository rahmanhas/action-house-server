const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())
require('dotenv').config()


app.get('/', (req, res) => {
  res.send('action-house-server is working...')
})


app.listen(port, () => {
  console.log(`action-house-server listening on port ${port}`)
})
