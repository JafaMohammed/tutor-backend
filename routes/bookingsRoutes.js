const express = require('express');

const {
    createBooking,updateBooking,
    deleteBooking,getAllBookings,
    getBooking,getCheckoutSession
}=require('../controllers/bookingController')

const auth = require('../middlewares/requireAuth');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router({mergeParams: true});
router.use(auth)

router.route('/')
    .get(restrictTo('admin','tutor'),getAllBookings)
    .post(restrictTo('student','admin'),createBooking)

router.route('/:id')
    .get(getBooking)
    .patch(restrictTo('student','admin'),updateBooking)
    .delete(restrictTo('student','admin'),deleteBooking)


module.exports = router;