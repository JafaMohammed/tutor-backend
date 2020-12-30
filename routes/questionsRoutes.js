const express=require('express')
const {
    getAllQuestions,
    getSingleQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion
}=require('../controllers/questionController')
const auth =require('../middlewares/requireAuth');
const restrictTo=require('../middlewares/restrictTo');

const router=express.Router({mergeParams: true});


router
    .route('/')
    .get(getAllQuestions)
    .post(auth,createQuestion)

router.use(auth)

router
    .route('/:id')
    .get(getSingleQuestion)
    .patch(updateQuestion)
    .delete(deleteQuestion)


module.exports=router;