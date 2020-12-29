require("dotenv").config();
const mongoose = require('mongoose');
const express = require('express');
const app = require ('./app');



mongoose.connect(
    process.env.MONGO_URI,
    {
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    },err =>{
    if(err){
        return console.log("connection failed!", err); 
    }
    console.log("MongoDB server connection successful!");
}
)




app.listen(3000, ()=>{
    console.log(`${process.env.NODE_ENV}  server running on port 3000`);
});

