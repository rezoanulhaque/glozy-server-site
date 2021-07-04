const express = require('express');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mdb7s.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productCollection = client.db(`${process.env.DB_NAME}`).collection("products");
    const shipmentCollection = client.db(`${process.env.DB_NAME}`).collection("shipment");
    const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
    const customerCollection = client.db(`${process.env.DB_NAME}`).collection("customer");
    // app.post('/addProduct', (req, res) => {
    //     const addProduct = req.body
    //     productCollection.insertOne(addProduct)
    //         .then(result => res.send(result.insertedCount > 0 ))
    //   })
      app.patch('/updateProduct', (req, res) =>{
        const objectId = req.query.id
        
        const name = req.body.name
        const sellername = req.body.sellername
        const price = req.body.price
        const stock = req.body.stock
        const key = req.body.key
        const category = req.body.category
        const description = req.body.description
        const features = JSON.parse(req.body.features)
        console.log(features)
        productCollection.updateOne({_id: ObjectId(objectId)},
        {
          $set: {
            name: name,
            sellername: sellername,
            stock: stock,
            key: key,
            category: category,
            price: price,
            description: description,
            features: features
        }
        })
        .then(result =>{
          res.send(result.modifiedCount > 0)
        })
      })
      app.get('/yourProductList', (req, res) => {
        const sellerName = req.query.name
        productCollection.find({sellername: sellerName})
        .toArray((err, documents) => {
          res.send(documents)
        })
      })
      app.get('/admin', (req, res) => {
        const userEmail = req.query.email;
        adminCollection.find({ email: userEmail })
            .toArray((err, result) => res.send(result))
      })
      app.post('/addProduct', (req, res) => {
        const name = req.body.name
        const sellername = req.body.sellername
        const price = req.body.price
        const stock = req.body.stock
        const key = req.body.key
        const category = req.body.category
        const description = req.body.description
        const features = JSON.parse(req.body.features)
        
        const file = req.files.file
        const newImg = file.data;
        const encImg = newImg.toString('base64');
    
        var image = {
          contentType: req.files.file.mimetype,
          size: req.files.file.size,
          img: Buffer.from(encImg, 'base64')
        };

        productCollection.insertOne({ image, name, sellername, price, stock, key, category, description, features })
          .then(result => res.send(result.insertedCount > 0))
      })

      app.get('/allProduct', (req, res) => {
        productCollection.find()
        .toArray((err, documents) => {
          res.send(documents)
        })
      })
      app.delete('/deleteSingleProduct/:id',(req, res) => {
        const id=req.params.id
        console.log(id);
        productCollection.deleteOne({_id:ObjectId(id)})
        .then(result => res.send(result.deletedCount>0))
    })
    app.get('/singleProductEdit/:id', (req, res) => {
      const key = req.params.id
      productCollection.find({_id: ObjectId(key)})
      .toArray((err, documents) => {
        res.send(documents)
      })
    })
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port);