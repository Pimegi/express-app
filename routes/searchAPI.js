const express = require('express');
const { getDb } = require('../db'); // Import the getDb function

const router = express.Router();

// GET route to handle search requests
router.get('/search', async (req, res) => {
    try {
        // Extract the search query from the request query parameters
        const searchQuery = req.query.q;

        // Get the database instance
        const db = getDb();

        // Perform the search query on the lessons collection
        const searchResults = await db.collection('lessons').find({
            $or: [
                { subject: { $regex: searchQuery, $options: 'i' } }, // Search for subject containing the query
                { location: { $regex: searchQuery, $options: 'i' } } // Search for location containing the query
            ]
        }).toArray();
        

        // Return the search results
        res.json(searchResults);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
