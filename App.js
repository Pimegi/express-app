const express = require('express');
const { connectToDatabase } = require('./db'); // Import the connectToDatabase function
const morgan = require('morgan');
const path = require('path');
const lessonsRouter = require('./routes/lessonsAPI');
const ordersRouter = require('./routes/orderAPI');
const searchRouter = require('./routes/searchAPI')
const app = express();
const PORT = process.env.PORT || 3000;


const cors=require("cors");     //Cross-origin resource sharing //
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
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

        // Routes
        app.use('/api', lessonsRouter);
        app.use('/api', ordersRouter);
        app.use('/api',searchRouter);

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
