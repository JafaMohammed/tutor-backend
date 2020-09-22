
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
        /*TODO provide phone number validation*/
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
    photo:{
        type: String,
        default: "default.png"
    },
    role: {
        type:String, 
        enum: ["admin", "user"],
        default: "user"
    },

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
});

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
        //with a parameter assumes error 
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




const User = mongoose.model("User", userSchema);

module.exports = User;

   
