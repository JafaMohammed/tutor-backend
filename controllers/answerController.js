const mongoose = require('mongoose')
const Answer  = mongoose.model('Answer')

const catchAsync=require('../utils/catchAsync')
const AppError = require('../utils/appError')
const {
    getOne, getAll,
    createOne
} =require('./handlerFactory')

exports.getSingleAnswer=getOne(Answer,'answer', {path: 'answers', select: '-__v'});
exports.createAnswer=createOne(Answer,'answer');
exports.getAllAnswers=getAll(Answer,'answer');
exports.updateAnswer=catchAsync(async (req,res,next)=>{
    const answerId=req.params.id;

    if (req.body.question) {
        return next(new AppError('You cannot update the question!', 400));
    }

    const answer=await Answer.findById(answerId);

    if(!answer) return next(new AppError(`No answer found with that ID`,404));

    //Check if the user updating answer is the one who provided the answer

    if (String(req.user._id)!==String(answer.user._id)) return next(new AppError('You are not authorized to update this answer',403))

    const updatedAnswer=await Answer.findByIdAndUpdate(answerId,req.body,{new:true,useFindAndModify:false,runValidators:true});

    res.status(200).json({
        status:"success",
        data:{
            review: updatedAnswer
        }
    })
});
//Question can only be deleted by user who asked
exports.deleteAnswer=catchAsync(async (req,res,next)=>{
    const answer=await Answer.findByIdAndDelete(req.params.id)
    if (!answer) return next(new AppError(new Error(`No answer found with that ID`),404));

    if (String(req.user._id)!==String(answer.user._id)) return next(new AppError('You cannot delete this question!',403))

    res.status(204).json({
        status:"success",
        data:null
    })
});