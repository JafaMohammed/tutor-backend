const mongoose = require('mongoose')
const AppError = require('../utils/appError')

const Review=mongoose.model('Review')
const _=require('lodash')
const catchAsync=require('../utils/catchAsync')
const {getOne,getAll}=require('../controllers/handlerFactory')

/*TODO review can only be created by student who has booked a tutor**/
exports.createReview=catchAsync(async (req,res,next)=>{
  if (!req.body.subject) req.body.subject=req.params.subjectId;
  if (!req.body.user) req.body.user=req.user._id;
  const newReview=await Review.create(req.body);
  res.status(201).json({
    status:'success',
    data:{
      review:_.pick(newReview,['_id','review','rating','subject','user','createdAt'])
    }
  })
})
exports.getAllReviews=getAll(Review,'reviews')
exports.getReview=getOne(Review,'review')

/* Review can only be updated by student who created review/admin */
exports.updateReview = catchAsync(async (req,res,next)=>{
  const reviewId=req.params.id;

  if (req.body.subject) {
    return next(new AppError('You cannot update the subject with review', 400));
  }

  const review=await Review.findById(reviewId);

  if(!review) return next(new AppError(`No review found with that ID`,404));

  //Check if the user updating is the one who wrote the review

  if (String(req.user._id)!==String(review.user._id)) return next(new AppError('You are not authorized to update this review',403))

  const updatedReview=await Review.findByIdAndUpdate(reviewId,req.body,{new:true,useFindAndModify:false,runValidators:true});

  res.status(200).json({
    status:"success",
    data:{
      review: updatedReview
    }
  })
});
/* Review can only be deleted by student who created review/admin */
exports.deleteReview=catchAsync(async (req,res,next)=>{
  const review=await Review.findByIdAndDelete(req.params.id)
  if (!review) return next(new AppError(new Error(`No review found with that ID`),404));

  if (String(req.user._id)!==String(review.user._id)) return next(new AppError('You cannot delete this review!',403))

  res.status(204).json({
    status:"success",
    data:null
  })
});