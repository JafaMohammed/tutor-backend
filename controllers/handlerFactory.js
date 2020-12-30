const catchAsync=require('../utils/catchAsync')
const AppError=require('../utils/appError')
const APIFeatures=require('../utils/apiFeatures')

exports.deleteOne=(Model,document)=>catchAsync(async (req,res,next)=>{
  const doc=await Model.findByIdAndDelete(req.params.id)
  if (!doc) return next(new AppError(new Error(`No ${document} found with that ID`),404));
  res.status(204).json({
    status:"success",
    data:null
  })
});

exports.updateOne=(Model,document) =>catchAsync(async (req,res,next)=>{
  const Id=req.params.id;

  const result=await Model.findByIdAndUpdate(Id,req.body,{new:true,useFindAndModify:false,runValidators:true});

    if(!result) return next(new AppError(new Error(`No ${document} found with that ID`),404));
    res.status(200).json({
      status:"success",
      data:{
        [document]:result
      }
    })
});

exports.createOne=(Model,document)=>catchAsync(async (req,res,next)=>{
  if (!req.body.user) req.body.user=req.user._id;

  const doc=await Model.create(req.body)
    res.status(200).json({
      status:"success",
      data: {
        [document]:doc
      }
    })


});

exports.getOne=(Model,document,popOptions)=>catchAsync(async (req,res,next)=>{
  const Id=req.params.id;
  let query=Model.findById(Id);
  if (popOptions) query=query.populate(popOptions)

  const doc=await query;

  if (!doc) return next(new AppError(`No ${document} found with that ID`,404));
  res.status(200).json({
    status:"success",
    data:{
      [document]:doc
    }
  });

});
exports.getAll=(Model,document)=>catchAsync(async (req,res,next)=>{

  //To allow for nested get reviews on facility and users
  let filter={}
  // if (req.params.facilityId) filter={facility:req.params.facilityId}
  if (req.params.userId) filter={user:req.params.userId}
  if (req.params.tutorId) {
    if (String(req.user._id)!==String(req.params.tutorId)) return next(new AppError('Only the tutor can view the subjects',400))
    filter = {tutor: req.params.tutorId}
  }
  //EXECUTE QUERY
  const features=new APIFeatures(Model.find(filter),req.query);
  features
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const doc=await features.query;
  // const doc=await features.query.explain();

  res.status(200).json({
    status:"success",
    results:doc.length,
    data:{
      [document]:doc
    },
  })


});
