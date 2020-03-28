const mongoose = require('mongoose');

const ClientAzykSchema = mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    phone: [String],
    address: [[String]],
    sync: [mongoose.Schema.Types.ObjectId],
    info: {
        type: String,
        default: ''
    },
    lastActive: {
        type: Date,
        default: null
    },
    reiting: Number,
    image: String,
    city: String,
    device: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAzyk'
    },
    notification: {
        type: Boolean,
        default: null
    },
    del: String,
}, {
    timestamps: true
});


const ClientAzyk = mongoose.model('ClientAzyk', ClientAzykSchema);

module.exports = ClientAzyk;