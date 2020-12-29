const express = require('express');
const auth =require('../middlewares/requireAuth')
const restrictTo =require('../middlewares/restrictTo')
const {
    createSubject, getAllSubjects,
    getOneSubject,updateSubject,
    deleteSubject
} =require('../controllers/subjectController')

const router =express.Router({mergeParams: true});


router
    .route('/')
    .get(getAllSubjects)
    /** Only for tutors*/
    .post(auth,restrictTo('admin','tutor'),createSubject);

router
    .route('/:id')
    .get(getOneSubject)
    /*TODO Only for tutors of the given subject*/
    .patch(auth,restrictTo('admin','tutor'),updateSubject)
    .delete(auth,restrictTo('admin','tutor'),deleteSubject)

module.exports = router;