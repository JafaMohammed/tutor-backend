const express = require('express');
const auth =require('../middleware/auth')
const restrictTo =require('../middleware/authorize')
const {
    createSubject, getAllSubjects,
    getOneSubject,updateSubject,
    deleteSubject
} =require('../controllers/tutorSubjectController')

const router =express.Router();

router.use(auth)

router
    .route('/')
    .get(getAllSubjects)
    /** Only for tutors*/
    .post(restrictTo('tutor','admin'),createSubject);

router
    .route('/:id')
    .get(getOneSubject)
    /*TODO Only for tutors of the given subject*/
    .patch(restrictTo('tutor','admin'),updateSubject)
    .delete(restrictTo('tutor','admin'),deleteSubject)

module.exports = router;