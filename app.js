
const mongoose = require('mongoose');
// const crypto = require('crypto');
const express = require('express');
const bodyParser = require("body-parser");

const users = require("./routes/users");

const error = require("./middleware/error")
const app = express();
//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//routes
app.use("/api/users",users);

app.use(error);



module.exports=app;