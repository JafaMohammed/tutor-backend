const mongoose=require('mongoose');
const Subject=require('./tutorSubjectModel')

const reviewSchema=new mongoose.Schema({
  review: {
    type:String,
  },
  rating: {
    type:Number,
    min:1,
    max:5
  },
  createdAt: {
    type:Date,
    default:Date.now()
  },
  subject:{
    type:mongoose.Schema.ObjectId,
    ref:'Tour',
    required:[true,'A review must belong to a tour']
  },
  user:{
    type:mongoose.Schema.ObjectId,
    ref:'User',
    required:[true,'A review must belong to a user']
  }
},{
  toJSON:{virtuals:true},
  toObject:{virtuals:true},
  id:false
});

reviewSchema.index({tour: 1,user:1},{unique:true})

reviewSchema.pre(/^find/,function(next) {

  this.populate({
    path:'user',
    select:'name photo'
  })
  next();
})

reviewSchema.statics.calcAverageRating = async function(subjectId){
  const stats= await this.aggregate([

    {
      $match: {subject: subjectId}
    },
    {
      $group: {
        _id: '$subject',
        numRatings: {$sum:1},
        avgRating: {$avg: '$rating'}
      }
    },
  ])
  // console.log(stats)
  if (stats.length>0){
    await Subject.findByIdAndUpdate(subjectId,{
      ratingsQuantity:stats[0].numRatings,
      ratingsAverage:stats[0].avgRating
    })
  }else{
    await Subject.findByIdAndUpdate(subjectId, {
      ratingQuantity: 0,
      ratingsAverage: 1.0
    })
  }
}
reviewSchema.post('save',async function(doc) {
  //this points to current review document
  await doc.constructor.calcAverageRating(this.subject)

})
//findByIdAndUpdate
//findByIdAndDelete
reviewSchema.pre(/^findOneAnd/,async function(next) {
  this.r =await this.findOne();
  // console.log(this.r);
  next();
})
reviewSchema.post(/^findOneAnd/,async function() {
  //await this.findOne does not work here, the query has already executed
  await this.r.constructor.calcAverageRating(this.r.subject)
})

const Review=mongoose.model('Review',reviewSchema);

module.exports=Review;