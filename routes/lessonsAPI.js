const express = require('express');
const router = express.Router();
const { client } = require('../db');

// GET route to retrieve all lessons
router.get('/lessons', async (req, res) => {
    try {
        // Get the database instance
        const db = client.db();

        // Retrieve all lessons from the database
        const lessons = await db.collection('lessons').find().toArray();

        res.json(lessons); // Return lessons as JSON
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT route to update lesson spaces after an order is submitted
router.put('/lessons/:id/update-spaces', async (req, res) => {
  try {
    const lessonId = req.params.id;
    const { spaces } = req.body;

    // Get the database from the client
    const db = client.db();

    // Update the lesson's spaces in the database
    const result = await db.collection('lessons').findOneAndUpdate(
      { _id: lessonId }, // Use the lessonId directly as it's already a string
      { $set: { spaces: spaces } },
      { returnOriginal: false } // Return the updated document
    );

    if (!result) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json({ message: 'Lesson spaces updated successfully', lesson: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
