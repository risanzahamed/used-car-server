const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 8000
require("dotenv").config()

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Used car server is running')
})

function jwtVerify(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).send('Unauthorized Access data not found');
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    })

}

const uri = "mongodb+srv://used-car:6nJgwg4Mee5MlOax@cluster0.h3zxwhp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {

        const carCategories = client.db('usedCar').collection('carCategory')
        const carDetailsByCategory = client.db('usedCar').collection('ourCarDetails')
        const carBookingsCollection = client.db('usedCar').collection('carsBooking')
        const carflagedCollection = client.db('usedCar').collection('flagedItems')
        const usersCollection = client.db('usedCar').collection('users')


        // JWT CODE
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);

            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '5d' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })


        app.get('/car-category', async (req, res) => {
            const query = {}
            const cursor = carCategories.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/car-category/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { category_id: id }
            const cars = await carCategories.findOne(query)
            res.send(cars)
        })

        app.get('/car-details', async (req, res) => {
            const query = {}
            const cursor = carDetailsByCategory.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { category_id: id }
            const cars = await carDetailsByCategory.find(query).toArray()
            res.send(cars)
        })

        app.post('/car-bookings', async (req, res) => {
            const carBooking = req.body

            const query = {
                buyerName: carBooking.buyerName,
                email: carBooking.email,
                phone: carBooking.phone,
                image: carBooking.image,
                category: carBooking.category,
                model: carBooking.model,
                price: carBooking.price,
                location: carBooking.location
            }

            const result = await carBookingsCollection.insertOne(query)
            res.send(result)
        })


        app.get('/car-bookings',jwtVerify, async (req, res) => {
            const email = req.query.email
            const decodedEmail = req.decoded.email

            if(email != decodedEmail){
                return res.status(403).send({message : 'unauthorized access data not found'})
            }
            console.log('token', req.headers.authorization);
            console.log(email);
            const query = { email: email }
            const carbookings = await carBookingsCollection.find(query).toArray()
            res.send(carbookings)

        })


        app.post('/flag-items', async (req, res) => {
            const flaged = req.body

            const query = {
                image: flaged.image,
                model: flaged.model,
                category: flaged.categoryName,
                description: flaged.description,
                resalePrice: flaged.resalePrice,
                originalPrice: flaged.originalPrice,
                postDate: flaged.postDate,
                yearsOfUse: flaged.yearsOfUse,
                location: flaged.location,
            }

            const result = await carflagedCollection.insertOne(query)
            res.send(result)
        })

        app.get('/flag-items', async (req, res) => {
            const email = req.query.email
            console.log(email);
            const query = { email: email }
            const carbookings = await carflagedCollection.find(query).toArray()
            res.send(carbookings)

        })

        app.get('/users', async(req, res)=>{
            const query = {}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/users', async(req, res)=>{
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })



    }

    finally {

    }

}

run()

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})