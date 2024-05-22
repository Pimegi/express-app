const express = require('express');
const { connectToDatabase } = require('./db'); // Import the connectToDatabase function
const morgan = require('morgan');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;


const cors = require("cors");     //Cross-origin resource sharing //
const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}




// Connect to MongoDB when the application starts
connectToDatabase()
    .then(() => {

        app.use(cors(corsOptions))

        // Logger Middleware - Morgan
        app.use(morgan('common'));

        // Middleware to parse JSON bodies
        app.use(express.json());

        // Static File Middleware
        const lessonImagesDirectory = path.join(__dirname, 'images');
        app.use('/images', express.static(lessonImagesDirectory));

        //display a message for root path to show tha API is working
        app.get('/', (req, res, next) => {
            res.send('Select a collection, e.g., /collection/messages')
        })

        //get the collection name
        app.param('collectionName', (req, res, next, collectionName) => {
            req.collection = db.collection(collectionName)
            //console.log('collection name:', req.collection)
            return next()
        })

        //retrieve all the objects from a collection
        app.get('/collection/:collectionName', (req, res, next) => {
            req.collection.find({}).toArray((e, results) => {
                if (e) return next(e)
                res.send(results)
            })
        })
        
        //adding post
        app.post('/collection/:collectionName', (req, res, next) => {
            req.collection.insert(req.body, (e, results) => {
                if (e) return next(e)
                res.send(results.ops)
            })
        })

        //return with object id
        const ObjectID = require('mongodb').ObjectID;
        app.get('/collection/:collectionName/:id'
            , (req, res, next) => {
                req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
                    if (e) return next(e)
                    res.send(result)
                })
            })

        //PUT
        app.put('/collection/:collectionName/:id', (req, res, next) => {
            req.collection.update(
                { _id: new ObjectID(req.params.id) },
                { $set: req.body },
                { safe: true, multi: false },
                (e, result) => {
                    if (e) return next(e)
                    res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' })
                })
        })

        //DELETE
        app.delete('/collection/:collectionName/:id', (req, res, next) => {
            req.collection.deleteOne(
                { _id: ObjectID(req.params.id) },
                (e, result) => {
                    if (e) return next(e)
                    res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' })
                })
        })

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
