const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config()

const app = express();

app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7mfhp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send('Hello from forest tea server')
})

client.connect(err => {
    const daily = client.db(process.env.DB_NAME).collection("daily_accounts");
    
    app.post('/insertDailyAccountRecord', (req, res) => {
       try {
        const data = req.body;

        daily.insertOne(data)
        .then(result => {
            res.status(200).send(result.acknowledged)
        })
       } catch (error) {
         return res.status(422).send(error.message);
       }
    })

    app.get('/dailyAccounts/:date', (req, res) => {
        const currentDate = req.params.date;

        daily.find({purchaseDate: currentDate})
        .toArray((err, documents) => {
            if(err){
                return res.status(422).send(err.message);
            }
            res.status(200).send(documents);
        })
    })

    console.log('Connected to mongo instance...')
  });

app.listen(process.env.PORT || 4000, () => {
    console.log('server is ready')
})



