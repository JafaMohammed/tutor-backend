const express=require('express')
const {getAllReviews,getReview,createReview,updateReview,deleteReview}=require('../controllers/reviewsController')
const auth =require('../middleware/auth');
const restrictTo=require('../middleware/authorize');

const router=express.Router({mergeParams: true});

router.use(auth)

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('student'),createReview)



router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('student','admin'),updateReview)
  .delete(restrictTo('student','admin'),deleteReview)


module.exports=router;