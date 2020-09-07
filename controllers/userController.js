const User = require ('../models/user');
const AppError =  require ("../utils/appError")
const catchAsync = require('../utils/catchAsync')

exports.getAllUsers = catchAsync(async(req,res,next)=>{
    const users = await User.find();
    res.status(200).json({
        status: "success",
         results: users.length,
         data: {
             users
         }
    })
 })
exports.getUser= catchAsync(async(req,res,next)=>{
   
        const user = await User.findById(req.params.id);

        if(!user) return next(new AppError("User does not exist", 404))
        res.status(200).json({
            status: "success",
    
             data: {
                 user
             }
        })
})
exports.createUser=  catchAsync(async(req,res,next)=>{
   
        const user = await User.create(req.body);
        res.status(200).json({
            status: "success",
             data: {
                 user
             }
        })
    
 })
exports.updateUser= catchAsync(async(req,res,next)=>{
    
    const user = await User.findByIdAndUpdate(req.params.id);
    if(!user) return next(new AppError("User does not exist", 404))
    res.status(200).json({
        status: "success",
         data: {
             user
         }
    })

 })
exports.deleteUser=catchAsync(async(req,res,next)=>{

    const user = await User.findByIdAndDelete(req.params.id);
    if(!user) return next(new AppError("User does not exist", 404))
    res.status(204).json({
        status: "success",
    })
 })




 const filterObj=(obj,...allowedFields)=>{
    // {name:req.body.name,email:req.body.email}
    const newObj={};
    Object.keys(obj).forEach(el=>{
      if (allowedFields.includes(el)) newObj[el]=obj[el];
    });
    return newObj;
  }
  exports.updateMe=catchAsync(async (req,res,next)=>{

    // 1) Create error if user posts password data
    if (req.body.password||req.body.passwordConfirm) return next(new AppError('This route is not for password updates. Please use /updateMyPassword',400));
  
    // 2) Get User
    if (!req.user) return next(new AppError(new Error('You are not logged in'),401));
  
    const filteredBody=filterObj(req.body,'name','email', 'subjects')
    if (req.file)  filteredBody.photo=req.file.filename;
    const updatedUser=await User.findByIdAndUpdate(req.user._id,filteredBody,{new:true,runValidators:true});
  
    // 3) Update user document
    res.status(200).json({
      status:'success',
      // user:_.pick(updatedUser,['_id', 'name', 'email', 'role','passwordChangedAt'])
      user:updatedUser
    })
  })