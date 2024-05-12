const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db'); // Import the getDb function

const router = express.Router();

// POST route to save a new order
router.post('/orders', async (req, res) => {
    try {
        // Extract order data from request body
        const { name, phoneNumber, lessonIds, numberOfSpaces } = req.body;

        // Get the database instance
        const db = getDb();

        // Create a new order document
        const result = await db.collection('orders').insertOne({
            name,
            phoneNumber,
            lessonIds,
            numberOfSpaces
        });

        const insertedId = result.insertedId; // Get the _id of the inserted document

        // Retrieve the newly inserted order
        const newOrder = await db.collection('orders').findOne({ _id: insertedId });

        res.status(201).json(newOrder); // Return the newly inserted order as JSON
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
