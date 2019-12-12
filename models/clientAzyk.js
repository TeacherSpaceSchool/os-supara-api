const mongoose = require('mongoose');

const ClientAzykSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: [String],
    address: [[String]],
    info: String,
    reiting: Number,
    image: String,
    city: String,
    type: String,
    birthday: Date,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAzyk'
    },
    patent: String,
    passport: String,
    certificate: String
}, {
    timestamps: true
});


const ClientAzyk = mongoose.model('ClientAzyk', ClientAzykSchema);

module.exports = ClientAzyk;