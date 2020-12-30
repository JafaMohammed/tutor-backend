const express=require('express')
const {
    getAllAnswers,
    getSingleAnswer,
    createAnswer,
    updateAnswer,
    deleteAnswer
}=require('../controllers/answerController')
const {createAnswerReview} = require('../controllers/answerReviewController')
const auth =require('../middlewares/requireAuth');

const router=express.Router({mergeParams: true});

router
    .route('/')
    .get(getAllAnswers)
    .post(auth,createAnswer)

router.use(auth)

router
    .route('/:id')
    .get(getSingleAnswer)
    .patch(updateAnswer)
    .delete(deleteAnswer)


//Review for an answer
router
    .route('/:answerId/upvote')
    .post(createAnswerReview)
//GET ALL REVIEWS FOR A USER
// router.use('/:userId/reviews',restrictTo('student','admin'),reviewRouter)

module.exports=router;