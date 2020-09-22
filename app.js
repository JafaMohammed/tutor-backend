const express = require('express');
const bodyParser = require("body-parser");

const users = require("./routes/usersRoutes");
const subjects = require("./routes/subjectsRoutes");
const AppError=require('./utils/appError')

const error = require("./middleware/error")
const app = express();
//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//routes
app.use("/api/v1/users",users);
app.use("/api/v1/subjects",subjects);

app.all('*',(req,res,next)=>{

    next(new AppError(`Can\'t find ${req.originalUrl} on this server!`,404));

})


app.use(error);



module.exports=app;