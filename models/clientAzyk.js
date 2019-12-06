const mongoose = require('mongoose');

const ClientAzykSchema = mongoose.Schema({
    name: String,
    email: String,
    address: [[String]],
    info: String,
    reiting: Number,
    image: String,
    birthday: Date,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAzyk'
    },
}, {
    timestamps: true
});


const ClientAzyk = mongoose.model('ClientAzyk', ClientAzykSchema);

module.exports = ClientAzyk;