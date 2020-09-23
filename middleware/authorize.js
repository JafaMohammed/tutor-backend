const AppError=require('../utils/appError');


const restrictTo=(...roles)=>{
    return (req,res,next)=>{
        console.log(req.user)
        console.log(roles)
        //roles is an array of input roles:['admin','tutor']
        if (!roles.includes(req.user.role) && !roles.includes(req.user.option)) return next(new AppError('You do not have permission to perform this action',403));
        next();
    }
}
module.exports =restrictTo;