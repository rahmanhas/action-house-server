const express = require('express')
require('dotenv').config()
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())

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

    app.get("/searchbytoyname/:toyname", async (req, res) => {
      const searchedToyName = req.params.toyname;

      const result = await toyCollection.find({ toyName: { $regex: searchedToyName, $options: "i" } }).toArray()
      res.send(result)
    })

    //Add a Toy
    app.post('/toys', async (req, res) => {
      const toy = req.body;
      const result = await toyCollection.insertOne(toy);
      res.send(result)
    })
    app.get('/alldata', async (req, res) => {
      const cursor = toyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    })
    //Home Page shop by category sorted
    app.get('/findsubcategory/:subCategory', async (req, res) => {
      const result = await toyCollection.find({ subCategory: req.params.subCategory }).limit(4).toArray();
      res.send(result)
    })
    app.get('/findtoyid/:id', async (req, res) => {
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
    app.get('/mytoys/:email', async (req, res) => {
      const result = await toyCollection.find({ sellerEmail: req.params.email }).toArray();
      res.send(result)
    })
    //sorting ascending order
    app.get('/ascendedtoy/:email', async (req, res) => {
      const cursor = toyCollection.find({ sellerEmail: req.params.email });
      const result = await cursor.toArray();
      result.forEach((document) => {
        document.price = parseFloat(document.price);
      });
      result.sort((a, b) => a.price - b.price);
      res.send(result);
    })
    //sorting descending order
    app.get('/descendedtoy/:email', async (req, res) => {
      const cursor = toyCollection.find({ sellerEmail: req.params.email });
      const result = await cursor.toArray();
      result.forEach((document) => {
        document.price = parseFloat(document.price);
      });
      result.sort((a, b) => b.price - a.price);
      res.send(result);
    })
    //Update Toy
    app.put("/updatetoy/:id", async (req, res) => {
      const id = req.params.id;
      const toy = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true }
      const updateToy = {
        $set: {
          price: toy.price,
          availableQuantity: toy.availableQuantity,
          detailDescription: toy.detailDescription
        }
      }
      const result = await toyCollection.updateOne(filter, updateToy, options);
      res.send(result);
    })
    //delete toy
    app.delete('/deletetoy/:id', async (req, res) => {
      const id = req.params.id;
      console.log('please delete from database', id);
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result)
    })
    //await client.db("admin").command({ ping: 1 });
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