const mongoose =require('mongoose')
const _ =require('lodash')

const User = require('./userModel')
const AppError = require('../utils/appError')

const subjectSchema=new mongoose.Schema({
    tutor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A subject must have a tutor']
    },
    subject:{
        type:String,
        enum: ['Chemistry', 'Physics', 'Biology', 'Mathematics'],
        required:[true,"Please enter your subject"],
    },
    rate:{
        type:Number,
        required:[true,"Please enter hourly rate"]
    },

},{
    toJSON: {virtuals:true},
    toObject: {virtuals:true},
    id: false
})


subjectSchema.pre('save',async function (next){
    const user = await User.findById(this.tutor);

    if (!user) return next(new AppError('User does not exist!',404));

    else if (user.option!=='tutor'){
        return next(new AppError('Only tutors can create subjects!',400))
    }
    next();

})
subjectSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tutor',
        select: 'name photo email phonenumber'
    })
    next();
})
const tutorSubjectModel =mongoose.model('Subject',subjectSchema);

module.exports = tutorSubjectModel