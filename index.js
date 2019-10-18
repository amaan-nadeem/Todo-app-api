const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const connectDB = require("./config/db");
const todoRoutes = require("./routes/todoRoutes");

// mongodb connection
connectDB();

// fetching body from body parser
app.use(bodyParser());

// cross origin
app.use(cors());

// registration route
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/todo", todoRoutes);

// 404 not found
app.use((req, res) =>
  res
    .status(404)
    .send({
      message: `API route not found`,
      route: `${req.hostname}${req.url}`
    })
);
PORT =  process.env.PORT || 8000;
app.listen(PORT, () => console.log("Connected"));
