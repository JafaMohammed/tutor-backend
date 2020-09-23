const express = require('express');
const bodyParser = require("body-parser");
const morgan=require('morgan');
const helmet = require('helmet')

const users = require("./routes/usersRoutes");
const subjects = require("./routes/tutorSubjectsRoutes");
const AppError=require('./utils/appError')

const error = require("./middleware/error")
const app = express();
//middleware
if (process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}
//HTTP SECURITY HEADERS
app.use(helmet());


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