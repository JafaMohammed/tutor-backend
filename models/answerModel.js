const mongoose = require('mongoose')

const answersSchema = new mongoose.Schema({
    question: {
        type:mongoose.Schema.ObjectId,
        ref:'Question',
        required:[true,'An answer must be for a question']
    },
    answer: {
      type: String,
      required: [true, 'Please provide your answer']
    },
    user:{
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
        path: 'user',
        select: 'firstName photo option'
    })
        .populate({
            path: 'question',
            select: '-user -__v -timeAsked -categories'
        })
    next()
})


mongoose.model('Answer', answersSchema)