const mongoose = require('mongoose')

const questionsSchema = new mongoose.Schema({
    question: {
        type: String,
        trim: true,
        required: [true,'Please write your question']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'A question must belong to a user']
    },
    timeAsked:{
        type: Date,
        default: Date.now()
    },
    categories:{
        type: [String],
        default: ['General']
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    id:false
})
//Virtual Populate the answers field
questionsSchema.virtual('answers',{
    ref: 'Answer',
    foreignField: 'question',
    localField: '_id'
})
//populate the user
questionsSchema.pre(/^find/, function (next){
    this.populate({
        path: 'user',
        select: 'firstName photo option'
    })
    next()
})

mongoose.model('Question', questionsSchema)
