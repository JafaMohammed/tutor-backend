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
    ratingsAverage:{
        type:Number,
        default:1,
        min:[1,'Rating must not be less than 1'],
        max:[5,'Rating must not be more than 5'],
        set:val=>Math.round(val*10)/10

    },
    ratingsQuantity:{
        type:Number,
        default: 0
    },
    rate:{
        type:Number,
        required:[true,"Please enter hourly rate"]
    },

},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    id:false
})

//Virtual populate
subjectSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'subject',
    localField:'_id'
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
        select: 'name photo'
    })
    next();
})
const tutorSubjectModel =mongoose.model('Subject',subjectSchema);

module.exports = tutorSubjectModel