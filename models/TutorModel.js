const mongoose = require('mongoose')
const User = mongoose.model('User')

const tutorSchema = new mongoose.Schema({

    summary: {
        type: String,
        required: [true, 'Please enter a summary.']
    },
    chargePerHour: {
        type: Number,
        required: [true, 'Please enter your hourly charge']
    },
    about: String,
    questionsAnswered: Number,
    hoursTaught: Number,
})

User.discriminator('Tutor', tutorSchema)
mongoose.model('Tutor')