const express = require('express');
const router = express.Router();
const Bug = require('../models/BugModel');

// @route   GET /api/bugs
// @desc    Get all bug reports
router.get('/', async (req, res) => {
  try {
    const bugs = await Bug.find().sort({ submittedAt: -1 });
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching bugs' });
  }
});

// @route   POST /api/bugs
// @desc    Submit a new bug report
router.post('/', async (req, res) => {
  try {
    const newBug = new Bug({
      name: req.body.name || 'ผู้ใช้งาน',
      phone: req.body.phone || '-',
      topic: req.body.topic,
      message: req.body.message
    });
    const savedBug = await newBug.save();
    res.status(201).json(savedBug);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit bug report' });
  }
});

// @route   PUT /api/bugs/:id
// @desc    Update bug status
router.put('/:id', async (req, res) => {
  try {
    const updated = await Bug.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bug status' });
  }
});

module.exports = router;
