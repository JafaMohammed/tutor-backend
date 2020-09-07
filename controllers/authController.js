const User = require ("../models/user");
const AppError =  require ("../utils/appError")
const catchAsync = require('../utils/catchAsync')
exports.signup = catchAsync(async(req,res,next)=>{
        const user = await User.create({
            name: req.body.name,
            phonenumber: req.body.phonenumber,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            option: req.body.option,
            photo: req.body.photo,
        
        });

        user.generateAuthToken(201, res);
      
 })

 exports.login = catchAsync(async(req,res,next)=>{

   const {email, password}= req.body;
   //user provides credential 
   if (!email  || !password) return next(new AppError("Please provide email and password", 400))
   //user exists
   const user = await User.findOne({email}).select("+password")
   
    if(!user||!await user.verifyPassword(password,user.password,next)) return next(new AppError("Incorrect email or password", 401))

    user.generateAuthToken(200, res);

 })