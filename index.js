const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7mfhp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.send("Hello from forest tea server");
});

client.connect((err) => {
  const daily = client.db(process.env.DB_NAME).collection("daily_accounts");

  // daily accounts operations

  app.post("/insertDailyAccountRecord", (req, res) => {
    try {
      const data = req.body;

      daily.insertOne(data).then((result) => {
        res.status(200).send(result.acknowledged);
      });
    } catch {}
  });

  app.get("/dailyAccounts/:date", (req, res) => {
    const currentDate = req.params.date;

    daily.find({}).toArray((err, documents) => {
      if (err) {
        return res.status(422).send(err.message);
      }
      res.status(200).send(documents);
    });
  });

  app.patch("/updatePaymentStatus/:id", (req, res) => {
    try {
      const id = req.params.id;
      const status = req.body;

      daily
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: { paymentStatus: status.status },
          }
        )
        .then((result) => {
          res.status(200).send(result.modifiedCount > 0);
        });
    } catch (error) {}
  });

  app.patch("/updateDeliveryStatus/:id", (req, res) => {
    try {
      const id = req.params.id;
      const status = req.body;

      daily
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: { deliveredStatus: status.status },
          }
        )
        .then((result) => {
          res.status(200).send(result.modifiedCount > 0);
        });
    } catch (error) {}
  });

  app.patch("/updateDailyAccountRecord/:id", (req, res) => {
    const id = req.params.id;
    const data = req.body;

    try {
      daily
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: data,
          }
        )
        .then((result) => {
          res.status(200).send(result.modifiedCount > 0);
        });
    } catch (error) {}
  });

  app.delete("/deleteRecord/:id", (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      daily.deleteOne({ _id: ObjectId(id) }).then((result) => {
        console.log(result);
        res.status(200).send(result.deletedCount > 0);
      });
    } catch (error) {}
  });

  console.log("Connected to mongo instance...");
});

app.listen(process.env.PORT || 4000, () => {
  console.log("server is ready");
});
