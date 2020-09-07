const express = require ('express');
const {auth}= require('../middleware/auth');
const restrictTo=require('../middleware/authorize')
const {getAllUsers, getUser, createUser, updateUser, deleteUser, updateMe} = require('../controllers/userController');
const {signup, login} = require ('../controllers/authController');
const router = express.Router();
router.post("/signup", signup);
router.post("/login",login);

router.use(auth);
//use update me 
router.use("/updateMe",updateMe);
router.use(restrictTo('admin'))

router.route("/" )
    .get(getAllUsers)
    .post(createUser);
//route parameter to get a SPECIFIC user(by id)    
router.route("/:id")
    .get( getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;