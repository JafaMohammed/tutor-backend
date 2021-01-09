const express=require('express')
const {
    getAllQuestions,
    getSingleQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion
}=require('../controllers/questionController')
const auth =require('../middlewares/requireAuth');
const answersRouter = require('../routes/answersRoutes')
const router=express.Router({mergeParams: true});

//GET ALL REVIEWS FOR A USER
router.use('/:questionId/answers',answersRouter)


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