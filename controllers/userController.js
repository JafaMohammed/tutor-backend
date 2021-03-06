const mongoose = require('mongoose')
const User = mongoose.model('User')
const sharp = require('sharp')
const multer = require('multer')
const AppError =  require ("../utils/appError")
const catchAsync = require('../utils/catchAsync')
const {deleteOne,updateOne,getOne,getAll}=require('../controllers/handlerFactory')


const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
    //check if uploaded file is an image
    if (file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }
}

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

//Runs after photo is uploaded
exports.resizeUserPhoto=catchAsync(async (req,res,next)=>{
    if (!req.file) return next();

    req.file.filename=`user-${req.user._id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/users/${req.file.filename}`);

    next();
})

exports.getMe=(req,res,next)=>{
    req.params.id=req.user._id;
    next();
}



exports.getAllUsers = getAll(User, 'users')
exports.getUser= getOne(User,'user',{path: 'subjects',select:'-__v '})

/**Only for admins**/
exports.createUser=  catchAsync(async(req,res,next)=>{
    const {name,email,password,passwordConfirm,passwordChangedAt,role} = req.body;
    const user = await User.create({
        name, email, password, passwordConfirm,
        passwordChangedAt, role
    })
    res.status(200).json({
        status:'success',
        user: _.omit(user.toObject(),['password','passwordChangedAt','active','__v'])
    })
 })
//Do not update password with this
exports.updateUser= updateOne(User,'user')
exports.deleteUser=deleteOne(User,'user')




const filterObj=(obj,...allowedFields)=>{
    // {name:req.body.name,email:req.body.email}
    const newObj={};
    Object.keys(obj).forEach(el=>{
      if (allowedFields.includes(el)) newObj[el]=obj[el];
    });
    return newObj;
  }
  //update currently logged in user
  exports.updateMe=catchAsync(async (req,res,next)=>{

    // 1) Create error if user posts password data
    if (req.body.password||req.body.passwordConfirm) return next(new AppError('This route is not for password updates. Please use /updateMyPassword',400));
  
    // 2) Get User
    if (!req.user) return next(new AppError('You are not logged in',401));
  
    const filteredBody=req.user.option==='tutor'?filterObj(req.body,'firstName','lastName','photo','summary','about'):filterObj(req.body,'firstName','lastName','photo', 'educationLevel')
    if (req.file)  filteredBody.photo=req.file.filename;
    const updatedUser=await User.findByIdAndUpdate(req.user._id,filteredBody,{new:true,useFindAndModify:false,runValidators:true});
  
    // 3) Update user document
    res.status(200).json({
      status:'success',
      // user:_.pick(updatedUser,['_id', 'name', 'email', 'role','passwordChangedAt'])
      user:updatedUser
    })
  })

//DELETE CURRENTLY LOGGED IN USER
exports.deleteMe=catchAsync(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user._id,{active:false});
    res.status(204).json({
        status:'success',
        data:null
    })
})

exports.getUsersStats = catchAsync(async (req,res,next)=>{
    const totalNumber = await User.aggregate([
        {$match: {role: 'user'}},
        {
            $group:{
                _id: '$option',
                numUsers: {$sum: 1},
            }
        }
    ])
    const education = await User.aggregate([
        {$match: {role: 'user'}},
        {
            $group:{
                _id: '$educationLevel',
                numUsers: {$sum: 1},
            }
        }
    ])
    res.status(200).json({
        status:"success",
        data:{
            totalNumber,
            education
        }
    })
})

