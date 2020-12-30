const mongoose = require('mongoose')

const User = mongoose.model('User')
const AppError =  require ("../utils/appError")
const catchAsync = require('../utils/catchAsync')
const sendEmail = require('../utils/email')
const _ = require('lodash');
const crypto=require('crypto');

exports.signup = catchAsync(async(req,res,next)=>{
    const {firstName,lastName, phoneNumber,email,password,passwordConfirm,option,photo}=req.body
    //cannot select admin role

    const user = await User.create({
        firstName,lastName,email,phoneNumber,password,
        passwordConfirm, option,photo
    });

    user.generateAuthToken(201, res);
    /* TODO send welcome email*/
      
 })

 exports.login = catchAsync(async(req,res,next)=>{

   const {email, password}= req.body;
   //user provides credential 
   if (!email  || !password) return next(new AppError("Please provide email and password", 400))
   //user exists
   const user = await User.findOne({email}).select("+password")
   
    if(!user||!await user.verifyPassword(password,user.password,next)) {
        return next(new AppError("Incorrect email or password", 401))
    }

    user.generateAuthToken(200, res);

 })

exports.forgotPassword = catchAsync(async (req,res,next)=>{
    // 1) Get user based on posted email
    const {email} = req.body;

    const user = await User.findOne({email});

    if (!user) return next(new AppError('There is no user with the specified email',404));

    //2) Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false})

    //3) Send Token to user through Email

    try{
        const resetURL=`${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;

        const message = `Forgot your password? Reset it at ${resetURL}.\n
         If you did not initiate this process, please ignore this email`;

        await sendEmail({
            email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        })
        /*TODO send token to user's email */
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })
    }catch (e) {
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;

        await user.save({validateBeforeSave:false});
        return next(new AppError('There was an error sending the email.Try again later!',500));
    }

})

exports.resetPassword=catchAsync(async (req,res,next)=>{
    // 1) get user based on the token
    const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user=await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}})

    // 2) If token has not expires and there is user, set the new password
    if (!user) return next(new AppError(new Error('Token is invalid or has expired'),400))
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;

    await user.save();

    //3) Update changedPasswordAt property for the user

    //4) Log user in, send JWT
    user.generateAuthToken(200,res);

})

//USER HAS TO BE LOGGED IN TO UPDATE PASSWORD
exports.updatePassword=catchAsync(async (req,res,next)=>{
    // 1) Get User
    if (!req.user) return next(new AppError('You are not logged in',401));
    const user=await User.findById(req.user._id).select('+password');
    // 2) Check if posted password is correct
    if (!await user.verifyPassword(req.body.password,user.password,next)) return next(new AppError('Incorrect Password!',401));

    // 3) Update password
    user.password=req.body.newPassword;
    user.passwordConfirm=req.body.newPasswordConfirm;
    await user.save()
    // 4) Log in user.
    user.generateAuthToken(200,res);

})