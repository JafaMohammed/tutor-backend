const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)
const Booking  = require('../models/bookingModel');
const Facility  = require('../models/facilityModel');

const {
    getOne, getAll,
    createOne, updateOne,
    deleteOne
} =require('./handlerFactory')

exports.getBooking=getOne(Booking,'booking');
exports.createBooking=createOne(Booking,'booking');
exports.getAllBookings=getAll(Booking,'bookings');
exports.updateBooking=updateOne(Booking,'booking');
exports.deleteBooking=deleteOne(Booking,'booking');
/*TODO stripe setup*/
exports.createCheckoutSession=async (req,res,next)=>{
    //Get currently booked facility
    const facility = await Facility.findById(req.params.facilityId)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items:[
            {
                name: `${facility.name} Facility`,
                description: facility.summary,
                //images
                //amount
                currency: 'ksh',
                //quantity
            },
        ],
        //success_url
        //cancel_url
        customer_email: req.user.email,
        client_reference_id: req.params.facilityId
    });
    res.status(200).json({
        status:'success',
        session
    })
}