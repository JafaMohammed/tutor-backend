const mongoose = require('mongoose')

const Subject = mongoose.model('Subject')
const _ =require('lodash');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {getOne,getAll,deleteOne} =require('../controllers/handlerFactory')

exports.createSubject = catchAsync(async (req,res,next)=>{
    if (!req.body.tutor) req.body.tutor = req.user._id;

    const newSubject = await Subject.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            subject: newSubject
        }
    })
})

exports.getAllSubjects = getAll(Subject,'subjects');
exports.getOneSubject = getOne(Subject, 'subject',{path: 'reviews',select: '--v'})
exports.updateSubject = catchAsync(async (req,res,next)=>{
    const subjectId=req.params.id;

    if (req.body.tutor) {
        return next(new AppError('You cannot update the tutor! Please contact administration for assistance', 400));
    }

    //Check if the tutor updating is the subject tutor
    const subject=await Subject.findById(subjectId);

    if(!subject) return next(new AppError(new Error(`No subject found with that ID`),404));

    if (String(req.user._id)!==String(subject.tutor._id)) return next(new AppError('You are not authorized to update this subject',403))

    const updatedSubject=await Subject.findByIdAndUpdate(subjectId,req.body,{new:true,useFindAndModify:false,runValidators:true});

    res.status(200).json({
        status:"success",
        data:{
            subject: updatedSubject
        }
    })
});
exports.deleteSubject = catchAsync(async (req,res,next)=>{
    const subject=await Subject.findByIdAndDelete(req.params.id)
    if (!subject) return next(new AppError(new Error(`No review found with that ID`),404));

    if (String(req.user._id)!==String(subject.tutor._id)) return next(new AppError('You cannot delete this subject!',403))

    res.status(204).json({
        status:"success",
        data:null
    })
});