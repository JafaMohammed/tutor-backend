const mongoose = require('mongoose')
const Answer  = mongoose.model('Answer')
const AnswerReview  = mongoose.model('AnswerReview')

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')


const {
    getOne, getAll,
    updateOne,
    deleteOne
} =require('./handlerFactory')

exports.getAnswerReview=getOne(AnswerReview,'answer_review');
exports.createAnswerReview= catchAsync (async (req,res,next)=>{
    if (!req.body.user) req.body.user = req.user._id;
    if (!req.body.answer) req.body.answer = req.params.answerId

    const answer = await Answer.findById(req.body.answer)
    if (!answer) return next(new AppError('No answer found with specified ID', 404))

    const answerReview = await AnswerReview.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            subject: answerReview
        }
    })
})
exports.getAllAnswerReviews=getAll(AnswerReview,'answer_review');
exports.updateAnswerReview=updateOne(AnswerReview,'answer_review');
exports.deleteAnswerReview =deleteOne(AnswerReview,'answer_review');
