const mongoose = require('mongoose')

const {promisify}=require('util')
const jwt = require('jsonwebtoken');
const User = mongoose.model('User')
const AppError =  require ("../utils/appError");
const catchAsync = require('../utils/catchAsync');

const requireAuth=catchAsync(async (req, res, next)=>{
    // 1) GET TOKEN AND CHECK IF IT EXISTS
    let token;
    const {authorization} = req.headers
    if(authorization && authorization.startsWith('Bearer')){
        token=req.headers.authorization.split(' ')[1]
    }
    if(!token) return next(new AppError('You are not logged in, please log in and try again.',401))

    // 2) VERIFY TOKEN

    const decoded =await promisify(jwt.verify) (token, process.env.JWT_SECRET)

    // 3) CHECK IF USER STILL EXISTS

     const currentUser = await User.findById(decoded.id)
     if(!currentUser) return next(new AppError('User does not exist', 401))
     req.user= currentUser;
     next()

})
module.exports=requireAuth;