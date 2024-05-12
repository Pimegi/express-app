const { MongoClient } = require('mongodb');

// Connection URL
const mongoURL = 'mongodb+srv://pimegi:admin@cluster0.a07grzv.mongodb.net/AfterSchool_classes?retryWrites=true&w=majority';

// Create a new MongoClient
const client = new MongoClient(mongoURL);

// Connect to the MongoDB server
async function connectToDatabase() {
    try {
        // Connect to the MongoDB server
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err; // Throw error if connection fails
    }
}

// Get the database
function getDb() {
    return client.db();
}

module.exports = {
    client,
    connectToDatabase,
    getDb
};
