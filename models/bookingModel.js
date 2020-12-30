const mongoose = require('mongoose');
const _ =require('lodash')

const bookingSchema=new mongoose.Schema({
    subject: {
        type: mongoose.Schema.ObjectId,
        ref: 'Subject',
        required: [true, 'A booking must be made for a subject tutor!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A booking must belong to a user!']
    },
    price: {
        type: Number,
        required: [true, 'A booking must include the price']
    },
    paid: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

})

bookingSchema.pre(/^find/, function (next) {
    this
        .populate({
            path: 'subject',
            select: 'subject rate'
        })
        .populate({
            path: 'user',
            select: 'name email'
        })
    next();
})
mongoose.model('Booking',bookingSchema);
