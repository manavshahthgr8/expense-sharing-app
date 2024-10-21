// controllers/userController.js
const db = require('../db');

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Create a new user
exports.createUser = (req, res) => {
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

    db.query(
        'INSERT INTO users (email, name, mobile) VALUES (?, ?, ?)', 
        [email, name, mobile], 
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to create user' });
            res.status(201).json({ message: 'User created successfully', user_id: result.insertId });
        }
    );
};

// Get user by ID
exports.get
