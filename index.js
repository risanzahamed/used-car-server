const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 8000
require("dotenv").config()

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Used car server is running')
})



const uri = "mongodb+srv://used-car:6nJgwg4Mee5MlOax@cluster0.h3zxwhp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {

        const carCategories = client.db('usedCar').collection('carCategory')
        const carDetailsByCategory = client.db('usedCar').collection('carDetails')

        // /category/${category._id}

        app.get('/car-category', async (req, res) => {
            const query = {}
            const cursor = carCategories.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/car-category/:id', async(req, res)=>{
            const id = req.params.id
            const query = {category_id : id}
            const cars = await carCategories.findOne(query)
            res.send(cars)
        })

        // app.get('/car-category/:id', async(req, res)=>{
        //     const id = req.params.id
        //     const query = {_id : ObjectId(id)}
        //     const result = await carCategories.filter(n => n.category_id == query)
        //     res.send(result)
        // })

        app.get('/car-details', async (req, res) => {
            const query = {}
            const cursor = carDetailsByCategory.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/car-details/:id', async(req, res)=>{

            const id = req.params.id
            const query = {category_id : id}
            const cars = await carDetailsByCategory.findOne(query)
            res.send(cars)
        })

        // app.get('/category/:id', async(req, res)=>{
        //     const id = req.body.category_id
        //     const query = {category_id : ObjectId(id)}
        //     const categoryCar = await carDetailsByCategory.find(query).toArray()
        //     res.send(categoryCar)


        // })


    }
    
    finally{

    }

}

run()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})