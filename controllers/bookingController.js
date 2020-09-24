const Booking  = require('../models/bookingModel');

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
