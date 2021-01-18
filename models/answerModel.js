const mongoose = require('mongoose')
const User = mongoose.model('User')

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
        select: 'firstName lastName photo'
    })
    //     .populate({
    //         path: 'question',
    //         select: '-user -__v -timeAsked -categories'
    //     })
    next()
})
answersSchema.statics.calcAnswersProvided = async function(userId){
    const stats= await this.aggregate([
        {$match: {user: userId}},
        {$group: {
                _id: '$user',
                answersProvided: {$sum:1},
            }
        },
    ])
    console.log(stats)
    if (stats.length>0){
        await User.findByIdAndUpdate(userId,{
            answersProvided:stats[0].answersProvided,
        })
    }else{
        await User.findByIdAndUpdate(userId, {
            answersProvided: 0
        })
    }
}
answersSchema.post('save',async function(doc) {
    //this points to current review document
    await doc.constructor.calcAnswersProvided(this.user)

})
//findByIdAndUpdate
//findByIdAndDelete
answersSchema.pre(/^findOneAnd/,async function(next) {
    this.r =await this.findOne();
    // console.log(this.r);
    next();
})
answersSchema.post(/^findOneAnd/,async function() {
    //await this.findOne does not work here, the query has already executed
    await this.r.constructor.calcAnswersProvided(this.r.user)
})


mongoose.model('Answer', answersSchema)