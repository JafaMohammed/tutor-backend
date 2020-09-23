const Subject = require('../models/tutorSubjectModel')
const _ =require('lodash');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {getOne,getAll,updateOne,deleteOne} =require('../controllers/handlerFactory')

exports.createSubject = catchAsync(async (req,res,next)=>{
    // if (!req.body.facility) req.body.facility = req.params.facilityId;
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
exports.getOneSubject = getOne(Subject, 'subject')
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
exports.deleteSubject = deleteOne(Subject,'subject');