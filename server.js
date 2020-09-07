//jshint esversion:6
require("dotenv").config();
const mongoose = require('mongoose');
const express = require('express');
const app = require ('./app');



mongoose.connect("mongodb+srv://admin:123letgp@cluster0.i0fa0.mongodb.net/tutorApp?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true},err =>{
    if(err){
        return console.log("connection failed!", err); 
    }
    console.log("connection succeeded!"); 
}
)




app.listen(3000, ()=>{
    console.log('Connected to MongoDB server, web service running on port 3000');
});

