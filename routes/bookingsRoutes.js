const express = require('express');

const {
    createBooking,updateBooking,
    deleteBooking,getAllBookings,
    getBooking,getCheckoutSession
}=require('../controllers/bookingController')

const auth = require('../middleware/authenticate');
const restrictTo = require('../middleware/authorize');

const router = express.Router({mergeParams: true});
router.use(auth)

router.use(restrictTo('admin', 'tutor'))
router.route('/')
    .get(restrictTo('admin','tutor'),getAllBookings)
    .post(restrictTo('student','admin'),createBooking)

router.route('/:id')
    .get(getBooking)
    .patch(restrictTo('student','admin'),updateBooking)
    .delete(restrictTo('student','admin'),deleteBooking)


module.exports = router;