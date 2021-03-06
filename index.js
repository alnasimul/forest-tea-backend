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
  const stocks = client.db(process.env.DB_NAME).collection("stocks");
  const returns = client.db(process.env.DB_NAME).collection("returns");
  const members = client.db(process.env.DB_NAME).collection("members");

  // member related operations

  app.get("/checkAdmin/:email", (req,res) => {
    const email = req.params.email;

    try {
      members.find({ role: "admin", email }).toArray((err, documents) => {
        res.status(200).send(documents.length > 0);
      });
    } catch (error) {
      
    }
  })

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
    const purchaseDate = req.params.date;

    daily.find({purchaseDate}).toArray((err, documents) => {
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

  app.patch("/updateSaleRecord/:id", (req, res) => {
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

  app.post('/searchAccountRecords', (req, res) => {

    const data = req.body;

    const {invoiceNo, customerName, email, phone, address, year, month} = data;

    try {
      if(invoiceNo){
        daily.find({invoiceNo})
        .toArray((err, documents) => {
          res.status(200).send(documents)
        })
      }
      else if(customerName){
        daily.find({customerName})
        .toArray((err, documents) => {
          res.status(200).send(documents)
        })
      }
      else if(email){
        daily.find({email})
        .toArray((err, documents) => {
          res.status(200).send(documents)
        })
      }
      else if(phone){
        daily.find({phone})
        .toArray((err, documents) => {
          res.status(200).send(documents)
        })
      }
      else if(address){
        daily.find({address})
        .toArray((err, documents) => {
          res.status(200).send(documents)
        })
      }
      else if(month){
        daily.find({month})
        .toArray((err, documents) => {
          res.status(200).send(documents)
        })
      }
      else if(year){
        daily.find({year})
        .toArray((err, documents) => {
          res.status(200).send(documents)
        })
      }
    } catch (error) {
        console.log(error)
    }
  })

  // stocks related oprerations

  app.post("/addStock", (req, res) => {
    const data = req.body;

    try {
      stocks.insertOne(data).then((result) => {
        res.status(200).send(result.acknowledged);
      });
    } catch (error) {}
  });

  app.get("/stocks", (req, res) => {
    try {
      stocks.find({}).toArray((err, documents) => {
        res.status(200).send(documents);
      });
    } catch (error) {}
  });

  app.get("/getProductByName/:name", (req, res) => {
    const name = req.params.name;

    stocks
      .find({ productName: { $regex: name, $options: '-i'} })
      .toArray((err, documents) => res.status(200).send(documents));
  });

  app.get("/stocksByName/:name", (req,res) => {
    const name = req.params.name;

    stocks.find({
      productName: { $regex: name, $options: '-i'}
    })
    .toArray((err, documents) => res.status(200).send(documents));
  })

  app.patch("/updateStock/:id", (req, res) => {
    const id = req.params.id;
    const data = req.body;

    try {
      stocks
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: data,
          }
        )
        .then((result) => {
          res.status(200).send(result.modifiedCount > 0);
        });
    } catch (error) {
      console.log(error);
    }
  });

  app.delete("/deleteStock/:id", (req, res) => {
    const id = req.params.id;

    try {
      stocks.deleteOne({ _id: ObjectId(id) }).then((result) => {
        res.status(200).send(result.deletedCount > 0);
      });
    } catch (error) {}
  });

  app.patch("/updateProductsStocksQuantity", (req, res) => {
    const data = req.body;
    try {
      data.forEach((element) => {
        stocks
          .updateOne(
            { _id: ObjectId(element.productId) },
            {
              $inc: { stock: -element.itemQuantity },
            }
          )
          .then((result) => res.status(200).send(result.modifiedCount > 0));
      });
    } catch (error) {
      console.log(error);
    }
  });

  app.patch("/returnProductsStocksQuantity", (req, res) => {
    const data = req.body;
    try {
      data.forEach((element) => {
        stocks
          .updateOne(
            { _id: ObjectId(element.productId) },
            {
              $inc: { stock: +element.itemQuantity },
            }
          )
          .then((result) => res.status(200).send(result.modifiedCount > 0));
      });
    } catch (error) {
      console.log(error);
    }
  });

  // return related operations

  app.post("/returnItems", (req, res) => {
    const data = req.body;

    try {
      returns.insertOne(data).then((result) => {
        res.status(200).send(result.acknowledged);
      });
    } catch (error) {}
  });

  app.get("/returns", (req, res) => {
    try {
      returns.find({}).toArray((err, documents) => {
        res.status(200).send(documents);
      });
    } catch (error) {}
  });

  app.delete("/deleteReturn/:id", (req, res) => {
    const id = req.params.id;

    try {
      returns
        .deleteOne({ _id: ObjectId(id) })
        .then((result) => res.status(200).send(result.deletedCount > 0));
    } catch (error) {}
  });

  console.log("Connected to mongo instance...");
});

app.listen(process.env.PORT || 4000, () => {
  console.log("server is ready");
});
