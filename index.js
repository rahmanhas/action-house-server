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

    // await client.connect();
    //client.connect();
    const toyCollection = client.db('actionHouse').collection('toys');
    const galleryCollection = client.db('actionHouse').collection('gallery-images');

    //indexing
    const indexKeys = {toyName:1, subCategory:1};
    const indexOptions = {name: "titleCategory"}

   const result = await toyCollection.createIndex(indexKeys, indexOptions)

    app.get("/searchbytoyname/:toyname",async(req,res)=>{
      const searchedToyName = req.params.toyname;

      const result = await toyCollection.find({
        $or:[
          {toyName: {$regex:searchedToyName,$options:"i"}},
          // {subCategory: {$regex:searchedToyName,$options:"i"}}
        ]
      }).toArray()
      res.send(result)
    })



    //Add a Toy
    app.post('/toys', async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await toyCollection.insertOne(toy);
      res.send(result)
    })
    app.get('/storedtoydata', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray()
      res.send(result);
    })
    app.get('/storedtoydata/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query)
      res.send(result);
    })
    app.get('/galleryimages', async (req, res) => {
      const cursor = galleryCollection.find();
      const result = await cursor.toArray()
      res.send(result);
    })
    //My Toys
    app.get('/mytoys/:email',async(req,res)=>{
      const result = await toyCollection.find({sellerEmail: req.params.email}).toArray();
      res.send(result)
    })
    //Update Toy
    app.put("/updatetoy/:id",async(req,res)=>{
      const id = req.params.id;
      const toy= req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true}
      const updateToy = {
        $set:{
          price: toy.price,
          availableQuantity: toy.availableQuantity,
          detailDescription: toy.detailDescription
        }
      }
      const result = await toyCollection.updateOne(filter,updateToy,options);
      res.send(result);

    })
    //delete toy
    app.delete('/deletetoy/:id',async(req,res)=>{
      const id = req.params.id;
      console.log('please delete from database',id);
      const query = {_id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result)
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
