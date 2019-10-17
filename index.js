const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
const todoRoutes = require('./routes/todoRoutes');


// mongodb connection 
connectDB();

// fetching body from body parser
app.use(bodyParser());

// registration route
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/todo', todoRoutes);
PORT = 8000 || process.env.PORT;
app.listen(PORT, () => console.log("Connected"));