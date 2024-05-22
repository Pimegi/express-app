const express = require('express');
const { connectToDatabase, getDb } = require('./db'); // Import the connectToDatabase and getDb functions
const morgan = require('morgan');
const path = require('path');
const cors = require("cors"); // Cross-origin resource sharing

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: '*',
    credentials: true, // access-control-allow-credentials:true
    optionSuccessStatus: 200,
};

// Connect to MongoDB when the application starts
connectToDatabase()
    .then(() => {
        const db = getDb(); // Get the database instance

        app.use(cors(corsOptions));

        // Logger Middleware - Morgan
        app.use(morgan('common'));

        // Middleware to parse JSON bodies
        app.use(express.json());

        // Static File Middleware
        const lessonImagesDirectory = path.join(__dirname, 'images');
        app.use('/images', express.static(lessonImagesDirectory));

        // Display a message for root path to show that API is working
        app.get('/', (req, res, next) => {
            res.send('Select a collection, e.g., /collection/messages');
        });

        // Get the collection name
        app.param('collectionName', (req, res, next, collectionName) => {
            req.collection = db.collection(collectionName);
            return next();
        });

        // Retrieve all the objects from a collection
        app.get('/collection/:collectionName', (req, res, next) => {
            req.collection.find({}).toArray((e, results) => {
                if (e) return next(e);
                res.send(results);
            });
        });

        // Add a new document to the collection
        app.post('/collection/:collectionName', (req, res, next) => {
            req.collection.insertOne(req.body, (e, result) => {
                if (e) return next(e);
                res.send(result.ops);
            });
        });

        // Return a document by ID
        const ObjectID = require('mongodb').ObjectID;
        app.get('/collection/:collectionName/:id', (req, res, next) => {
            req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
                if (e) return next(e);
                res.send(result);
            });
        });

        // Update a document by ID
        app.put('/collection/:collectionName/:id', (req, res, next) => {
            req.collection.updateOne(
                { _id: new ObjectID(req.params.id) },
                { $set: req.body },
                { safe: true, multi: false },
                (e, result) => {
                    if (e) return next(e);
                    res.send((result.modifiedCount === 1) ? { msg: 'success' } : { msg: 'error' });
                }
            );
        });

        // Delete a document by ID
        app.delete('/collection/:collectionName/:id', (req, res, next) => {
            req.collection.deleteOne(
                { _id: new ObjectID(req.params.id) },
                (e, result) => {
                    if (e) return next(e);
                    res.send((result.deletedCount === 1) ? { msg: 'success' } : { msg: 'error' });
                }
            );
        });

        // Error Handling Middleware 
        app.use((err, req, res, next) => {
            console.error(err);
            res.status(500).json({ message: 'Server Error' });
        });

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); // Exit the process if MongoDB connection fails
    });
