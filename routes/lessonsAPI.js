const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// GET route to retrieve all lessons
router.get('/lessons', async (req, res) => {
  try {
    // Get the database instance
    const db = getDb();

    // Retrieve all lessons from the database
    const lessons = await db.collection('lessons').find().toArray();

    res.json(lessons); // Return lessons as JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT route to update lesson spaces after an order is submitted
router.put('/lessons/update-spaces', async (req, res) => {
  try {
    const { lessonIds, spaces } = req.body;

    // Get the database from the client
    const db = getDb();

    // Update the lesson spaces for each ID in the array
    const results = await Promise.all(lessonIds.map(async (id, index) => {
      const result = await db.collection('lessons').findOneAndUpdate(
        { _id: id },
        { $set: { spaces: spaces[index] } },
        { returnDocument: 'after' }
      );
      return result.value;
      
    }));

    res.json({ message: 'Lesson spaces updated successfully', lessons: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;