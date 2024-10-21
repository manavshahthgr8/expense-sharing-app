
// Controller/expenseController.js
const db = require('../db');

// Add an expense
exports.addExpense = (req, res) => {
    const { amount, description, split_method, payer_id, splits } = req.body;

    if (!amount || amount <= 0 || !['equal', 'exact', 'percentage'].includes(split_method)) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    // For 'percentage' split method, ensure percentages sum up to 100%
    if (split_method === 'percentage') {
        const totalPercentage = splits.reduce((total, split) => total + (split.percentage || 0), 0);
        if (totalPercentage !== 100) {
            return res.status(400).json({ error: 'Percentages must sum to 100%' });
        }
    }

    // For 'exact' split method, ensure the amounts match the total expense
    if (split_method === 'exact') {
        const totalSplit = splits.reduce((total, split) => total + (split.amount || 0), 0);
        if (totalSplit !== amount) {
            return res.status(400).json({ error: 'The total of split amounts must equal the expense amount' });
        }
    }

    // Insert the expense into the database
    db.query('INSERT INTO expenses (amount, description, split_method, payer_id) VALUES (?, ?, ?, ?)', 
    [amount, description, split_method, payer_id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to add expense' });
        const expense_id = result.insertId;

        // Insert each split into the database
        splits.forEach(split => {
            db.query('INSERT INTO expense_splits (expense_id, user_id, amount, percentage) VALUES (?, ?, ?, ?)', 
            [expense_id, split.user_id, split.amount || 0, split.percentage || 0]);
        });

        res.status(201).json({ message: 'Expense added successfully', expense_id });
    });
};

// Get all expenses
exports.getAllExpenses = (req, res) => {
    const getExpensesQuery = `
        SELECT e.id, e.amount, e.description, e.split_method, e.payer_id,
               u.name AS payer_name,
               GROUP_CONCAT(CONCAT(s.user_id, ':', s.amount, ':', s.percentage) SEPARATOR ';') AS splits
        FROM expenses e
        LEFT JOIN expense_splits s ON e.id = s.expense_id
        LEFT JOIN users u ON e.payer_id = u.id
        GROUP BY e.id
    `;

    db.query(getExpensesQuery, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to retrieve expenses' });
        }
        res.status(200).json(result);
    });
};

// Retrieve individual user expenses
exports.getUserExpenses = (req, res) => {
    const userId = req.params.user_id;

    db.query(`
        SELECT e.id, e.amount, e.description, e.split_method, es.amount AS split_amount, es.percentage 
        FROM expenses e 
        JOIN expense_splits es ON e.id = es.expense_id 
        WHERE es.user_id = ?
    `, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve user expenses' });
        res.json(results);
    });
};

// Retrieve overall expenses for all users
exports.getOverallExpenses = (req, res) => {
    db.query(`
        SELECT e.id, e.amount, e.description, e.split_method, u.name AS payer_name
        FROM expenses e
        JOIN users u ON e.payer_id = u.id
    `, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve overall expenses' });
        res.json(results);
    });
};


// Controller/expenseController.js
const json2csv = require('json2csv').parse;

// Download balance sheet for all users
exports.downloadBalanceSheet = (req, res) => {
    // Your logic to fetch users and expenses, then generate CSV
    const users = []; // Fetch users from database
    const expenses = []; // Fetch expenses from database
    
    // Prepare CSV data
    const csvData = []; // Format your data for CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(csvData);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('balance_sheet.csv');
    res.send(csv);
};
