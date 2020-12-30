const mongoose = require('mongoose')
const Answer = mongoose.model('Answer')

const answerReviewSchema = new mongoose.Schema({
    answer: {
        type:mongoose.Schema.ObjectId,
        ref:'Answer',
        required:[true,'Your upvote must be for an answer']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'A question must belong to a user']
    },
})

answerReviewSchema.index({answer: 1,user:1},{unique:true})

answerReviewSchema.statics.calcTotalUpvotes = async function(answerId){
    const upvotes = await this.aggregate([
        {$match: {answer: answerId}},
        {$group: {
            _id: '$answer',
            totalUpvotes: {$sum: 1}
            }
        }
    ]);
    if (upvotes.length>0){
        await Answer.findByIdAndUpdate(answerId,{
            totalUpvotes: upvotes[0].totalUpvotes
        })
    }else{
        await Answer.findByIdAndUpdate(answerId,{
            totalUpvotes: 0
        })
    }
}
answerReviewSchema.post('save', async function (doc){
    //this points to current review document
    await doc.constructor.calcTotalUpvotes(this.answer)
})
//findByIdAndUpdate
//findByIdAndDelete
answerReviewSchema.pre(/^findOneAnd/,async function(next) {
    this.r =await this.findOne();
    // console.log(this.r);
    next();
})
answerReviewSchema.post(/^findOneAnd/,async function() {
    //await this.findOne does not work here, the query has already executed
    await this.r.constructor.calcTotalUpvotes(this.r.answer)
})

answerReviewSchema.pre(/^find/,function(next) {

    this.populate({
        path:'user',
        select:'name photo'
    })
        .populate({
            path: 'answer',
            select: '-user -timeAnswered -question -__v'
        })
    next();
})

mongoose.model('AnswerReview', answerReviewSchema)