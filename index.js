const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(cors())
app.use(express.json())
require('dotenv').config()

const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.di1kiaj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {

    await client.connect();
    const toyCollection = client.db('actionHouse').collection('toys');

    //Add a Toy
    app.post('/toys', async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = toyCollection.insertOne(toy);
      res.send(result)
    })
    app.get('/storedtoydata', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray()
      res.send(result);
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('action-house-server is working...')
})


app.listen(port, () => {
  console.log(`action-house-server listening on port ${port}`)
})
