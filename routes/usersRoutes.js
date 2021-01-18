const express = require ('express');
const auth= require('../middlewares/requireAuth');
const restrictTo=require('../middlewares/restrictTo')
const {
    getAllUsers, getUser,
    createUser, updateUser,getMe,
    deleteUser, updateMe,deleteMe,
    getUsersStats,
    uploadUserPhoto,
    resizeUserPhoto
} = require('../controllers/userController');

const {updatePassword} = require('../controllers/authController')

const router = express.Router();
const subjectRouter=require('./subjectsRoutes')
const reviewRouter=require('./reviewsRoutes')

router.route('/user-stats').get(getUsersStats)

router.use(auth);
//use update me
router.get('/me',getMe,getUser)
router.use(
    "/updateMe",
    uploadUserPhoto,
    resizeUserPhoto,
    updateMe
);
router.use("/deleteMe",deleteMe);
router.use("/updateMyPassword",updatePassword);


//NESTED ROUTE -- /users/id/subjects - Get all subjects for a tutor
router.use('/:tutorId/subjects',restrictTo('tutor','admin'),subjectRouter)
//GET ALL REVIEWS FOR A USER
router.use('/:userId/reviews',restrictTo('student','admin'),reviewRouter)

// router.use(restrictTo('admin'))

router.route("/" )
    .get(getAllUsers)
    .post(createUser);
//route parameter to get a SPECIFIC user(by id)    
router.route("/:id")
    .get( getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;