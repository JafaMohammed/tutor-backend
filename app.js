require('./models/userModel')
require('./models/subjectModel')
require('./models/reviewModel')
require('./models/bookingModel')
require('./models/questionModel')
require('./models/answerModel')
require('./models/answerReviewModel')

const express = require('express');
const bodyParser = require("body-parser");
const morgan=require('morgan');
const helmet = require('helmet')
const cors = require('cors')

const users = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const subjects = require("./routes/subjectsRoutes");
const bookings = require("./routes/bookingsRoutes");
const reviews = require("./routes/reviewsRoutes");
const questions = require("./routes/questionsRoutes");
const answers = require("./routes/answersRoutes");
const AppError=require('./utils/appError')

const errorHandler = require("./middlewares/errorHandler")
const app = express();
//middlewares
app.use(cors())
if (process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}
//HTTP SECURITY HEADERS
app.use(helmet());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//routes
app.use("/api/v1/users",users);
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/subjects",subjects);
app.use("/api/v1/bookings",bookings);
app.use("/api/v1/reviews",reviews);
app.use("/api/v1/questions",questions);
app.use("/api/v1/answers",answers);

app.all('*',(req,res,next)=>{
    next(new AppError(`Can\'t find ${req.originalUrl} on this server!`,404));
})

app.use(errorHandler);

module.exports=app;