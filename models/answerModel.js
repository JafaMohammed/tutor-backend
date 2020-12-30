const mongoose = require('mongoose')

const answersSchema = new mongoose.Schema({
    question: {
        type:mongoose.Schema.ObjectId,
        ref:'Question',
        required:[true,'An answer must be for a question']
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'A question must belong to a user']
    },
    timeAnswered:{
        type: Date,
        default: Date.now()
    },
    totalUpvotes: {
        type: Number,
        default: 0
    }
})

answersSchema.pre(/^find/, function (next){
    this.populate({
        path: 'userId',
        select: 'firstName photo option'
    })
    next()
})

mongoose.model('Answer', answersSchema)