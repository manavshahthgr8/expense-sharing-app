// Main server code
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const userRoutes = require('./Routes/userRoutes');
const expenseRoutes = require('./Routes/expenseRoutes');

const app = express();
app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
