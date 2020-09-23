const express = require ('express');
const auth= require('../middleware/auth');
const restrictTo=require('../middleware/authorize')
const {
    getAllUsers, getUser,
    createUser, updateUser,getMe,
    deleteUser, updateMe,deleteMe
} = require('../controllers/userController');
const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    updatePassword
} = require ('../controllers/authController');

const router = express.Router();
const tutorSubjectsRouter=require('./tutorSubjectsRoutes')

router.post("/signup", signup);
router.post("/login",login);
router.post('/forgotPassword',forgotPassword)
router.patch('/resetPassword/:token',resetPassword)

router.use(auth);
//use update me
router.get('/me',getMe,getUser)
router.use("/updateMe",updateMe);
router.use("/deleteMe",deleteMe);
router.use("/updateMyPassword",updatePassword);


//NESTED ROUTE -- /users/id/subjects - Get all subjects for a tutor
router.use('/:tutorId/subjects',restrictTo('tutor','admin'),tutorSubjectsRouter)

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