const crypto=require('crypto');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const _ = require('lodash');
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const AppError = require("../utils/appError");

const userOptions = {discriminatorKey: 'option'}

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required:[true, "Please provide your first name"],
        minlength:3,
        maxlength:50,
    },
    lastName: {
        type: String,
        required:[true, "Please provide your last name"],
        minlength:3,
        maxlength:50,
    },
    phoneNumber: {
        type:Number,
        /*TODO provide phone number validation*/
        //validate: [validator.isMobilePhone, "Please enter a valid phone number"],
        // required:[true, "Please enter a valid phone number"]

    },
    email: {
        type:String,
        required:[true, "Please provide your email"],
        unique:true,
        lowercase:true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    password:{
        type:String,
        required:[true, "Please input your password"],
        minlength:8,
        select: false
    },
    passwordConfirm:{
        type:String,
        required:[true, "Please confirm the password"],
        validate: {
            validator: function(val) {
                //return t or f
                return this.password === val;
            },
            message: "Passwords do not match",
        }
    },
    option:{
        type:String,
        required: [true, 'Please register as a student or a tutor'],
        enum: {
            values: ['parent','tutor', 'student'],
            message: 'You must be either a student or a tutor'
        },
    },
    educationLevel: {
        type: String,
        required: [true, 'Please provide your level of education'],
        eval: ['university', 'secondary', 'primary', 'pre-school', 'none']
    },
    photo:{
        type: String,
        default: "default.png"
    },
    role: {
        type:String,
        //cannot select admin
        enum: ['admin','user'],
        default: 'user'
    },
    answersProvided: {
        type: Number,
        default: 0
    },

    //TUTOR ONLY
    summary: {
        type: String,
    },
    about: String,
    questionsAnswered: Number,
    hoursTaught: Number,


    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default: true,
        select:false
    }
    
},{
    toJSON: {virtuals:true},
    toObject: {virtuals:true},
    id: false
},userOptions);

userSchema.virtual('subjects',{
    ref: 'Subject',
    foreignField: 'tutor',
    localField: '_id'
})

userSchema.pre('save',function (next){
    if (!this.isModified('password')||this.isNew) return next();

    this.passwordChangedAt = Date.now()-1000;
    next();
})

//executes upon password modified
userSchema.pre("save",async function(next){
    try{
        if(!this.isModified('password')) return next() 

       this.password= await bcrypt.hash(this.password, saltRounds);
       this.passwordConfirm = undefined;
       next()

    }catch(e){
        next(e)
    }

})

//Generate JWT
userSchema.methods.generateAuthToken= function(statusCode,res){
    
        const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP })
    
        return res.status(statusCode).json({
            status: "success",
            token,
            data: {
                user: _.omit(this.toObject(),['password','passwordChangedAt','__v','active'])
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
//- --Check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter =function (JWTTimestamp){
    if (this.passwordChangedAt){
        const changedTimestamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTTimestamp<changedTimestamp;//if true, password was changed
    }
    return false;
}

// --Create password reset token for resetting user password
userSchema.methods.createPasswordResetToken = function (){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // console.log({ resetToken }, this.passwordResetToken);
    return resetToken;
}




mongoose.model("User", userSchema);



   
