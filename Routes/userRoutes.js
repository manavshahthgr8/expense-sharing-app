// Routes for user-related operations
const express = require('express');
const db = require('../db'); // Ensure the correct path to your db.js file
const router = express.Router();

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Create a new user
router.post('/', (req, res) => {
    const { email, name, mobile } = req.body;

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
    }
    if (!/^\d{10}$/.test(mobile)) {
        return res.status(400).json({ error: 'Invalid mobile number. It should be 10 digits.' });
    }

    db.query('INSERT INTO users (email, name, mobile) VALUES (?, ?, ?)', [email, name, mobile], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to create user' });
        res.status(201).json({ message: 'User created successfully', user_id: result.insertId });
    });
});

// Get user by ID
router.get('/:user_id', (req, res) => {
    const userId = req.params.user_id;
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!result.length) return res.status(404).json({ error: 'User not found' });
        res.json(result[0]);
    });
});

module.exports = router;

