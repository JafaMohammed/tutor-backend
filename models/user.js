//jshint esversion:6
//next takes us to the next middleware
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const _ = require('lodash');
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const AppError = require("../utils/appError");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, "Please provide your name"],
        minlength:5,
        maxlength:50,
    },
    phonenumber: {
        type:Number,
        //validate: [validator.isMobilePhone, "Please enter a valid phone number"],
        required:[true, "Please enter a valid phone number"]
        
    },
    email: {
        type:String,
        required:[true, "Please provide your email"],
        unique:true,
        lowercase:true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    option:{
        type:String,
        enum: ["tutor","student"],
        required:[true, "Please select an option"]
    },
    subjects:[
        {
            name:{
                type:String,
                required:[true,"Please enter your subject"],
            },
            rate:{
                type:Number,
                required:[true,"Please enter hourly rate"]
            },
            
        }
    ],
    password:{
        type:String,
        required:[true, "Please input your password"],
        minlength:8,
        select: false
    },
    passwordConfirm:{
        type:String,
        required:[true, "Please confirm the password"],
        validate: function(val){
            //return t or f
            return this.password === val;
        },
        message: "Passwords do not match",
        
    },
    photo:{
        type: String,
        default: "default.png"
    },
    role: {
        type:String, 
        enum: ["admin", "user"],
        default: "user"
    }
    
});
//executes upon password m0dified
userSchema.pre("save",async function(next){
    try{
        if(!this.isModified('password')) return next() 

       this.password= await bcrypt.hash(this.password, saltRounds);
       this.passwordConfirm = undefined;
       next()

    }catch(e){
        //with a parameter assumes error 
        next(e)
    }

}) 

// userSchema.pre("findOneAndUpdate",async function(next){

// if (this.getUpdate().$set.subjects) {
//     if(this.option !== "tutor"){
//         return next(new AppError("Only tutors can add subjects", 401))
//     }else{
//         return next()
//     }
// }else{
//     return next()
// }
// }) 


//create a fxn called authgenerate token 
userSchema.methods.generateAuthToken= function(statusCode,res){
    
        const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP })
    
        return res.status(statusCode).json({
            status: "success",
            token,
            data: {
                user:_.pick(this, ['_id','name', 'email', 'phonenumber', 'option', 'role', 'photo'])
            }
        })

}


userSchema.methods.verifyPassword = async function (candidatePassword, dbPassword,next){
    
    try{
       return await bcrypt.compare(candidatePassword, dbPassword)
    }
    catch(e){
        next(e)
    }

}




const User = mongoose.model("User", userSchema);

module.exports = User;

   
