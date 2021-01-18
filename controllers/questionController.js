const mongoose = require('mongoose')
const Question  = mongoose.model('Question')

const catchAsync=require('../utils/catchAsync')
const AppError = require('../utils/appError')
const {
    getOne, getAll,
    createOne
} =require('./handlerFactory')

exports.getSingleQuestion=getOne(Question,'question', {path: 'answers', select: '-__v'});
exports.createQuestion=createOne(Question,'question');
exports.getAllQuestions=getAll(Question,'question',{path:'answers', select: '-__v'});
exports.updateQuestion=catchAsync(async (req,res,next)=>{
    const questionId=req.params.id;

    const question=await Question.findById(questionId);

    if(!question) return next(new AppError(`No question found with that ID`,404));

    //Check if the user updating is the one who asked the question

    if (String(req.user._id)!==String(question.user._id)) return next(new AppError('You are not authorized to update this question',403))

    const updatedQuestion=await Question.findByIdAndUpdate(questionId,req.body,{new:true,useFindAndModify:false,runValidators:true});

    res.status(200).json({
        status:"success",
        data:{
            review: updatedQuestion
        }
    })
});
//Question can only be deleted by user who asked
exports.deleteQuestion=catchAsync(async (req,res,next)=>{
    const question=await Question.findByIdAndDelete(req.params.id)
    if (!question) return next(new AppError(new Error(`No question found with that ID`),404));

    if (String(req.user._id)!==String(question.user._id)) return next(new AppError('You cannot delete this review!',403))

    res.status(204).json({
        status:"success",
        data:null
    })
});