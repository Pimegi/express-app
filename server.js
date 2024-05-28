//Import dependencies modules:
const express = require("express");
const morgan = require('morgan');
const path = require('path');


//Create an Express.js instance:
const app = express();

//config Express.js
app.use(express.json());
app.set("port", 3000);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});


// Logger Middleware - Morgan
app.use(morgan('common'));


//connect to MongoDB
const MongoClient = require("mongodb").MongoClient;

let db;
MongoClient.connect(
  "mongodb+srv://pimegi:admin@cluster0.a07grzv.mongodb.net/",
  (err, client) => {
    db = client.db("Webstore");
  }
);

// Static File Middleware
const lessonImagesDirectory = path.join(__dirname, 'images');
app.use('/images', express.static(lessonImagesDirectory));

//display a message for root path to show tha API is working
app.get("/", (req, res, next) => {
  res.send("Select a collection, e.g., /collection/messages");
});

// return with object id
const objectID = require("mongodb").ObjectID;
app.get("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.findOne({ _id: new objectID(req.params.id) }, (e, result) => {
    if (e) return next(e);
    res.send(result);
  });
});


// get the collection name
app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  //console.log('collection name: req.collection)
  return next();
});

//retrieve all the objects from an collection
app.get("/collection/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(results);
  });
});

// adding post
app.post("/collection/:collectionName", (req, res, next) => {
  req.collection.insert(req.body, (e, results) => {
    if (e) return next(e);
    res.send(results.ops);
  });
});

// Update an object in a collection by ID
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        { _id: new objectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e);
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' });
        }
    );
});


app.delete('/collection/:collectionName/:id', (req, res, next) => {
  req.collection.deleteOne(
    {_id: objectID(req.params.id)},
    (e, result) => {
      if (e) return next(e)
        res.send((result.result.n === 1) ? {msg: 'success'}: {msg: 'error'})
    })
})

// search for products //
app.get('/:collectionName/search', (req, res, next) => {
  const query = req.query.q;
  if (!query) {
    res.status(400).send({ error: 'Query parameter is required' });
    return;
  }

  req.collection.find({
    $or: [
      { subject: { $regex: query, $options: 'i' } },
      { location: { $regex: query, $options: 'i' } }
    ]
  }).toArray((e, results) => {
    if (e) return next(e);
    res.send(results);
  });
});

app.listen(3000, () => {
  console.log("Express.js server running at localhost:3000");
});
