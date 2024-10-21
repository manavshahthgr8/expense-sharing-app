// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../Controller/expenseController');

// Add an expense
router.post('/', expenseController.addExpense);

// Retrieve all expenses
router.get('/', expenseController.getAllExpenses);

// Retrieve individual user expenses
router.get('/user/:user_id', expenseController.getUserExpenses);

// Download balance sheet
router.get('/download', expenseController.downloadBalanceSheet);


module.exports = router;

