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
    info: {
        type: String,
        default: ''
    },
    lastActive: Date,
    reiting: Number,
    image: String,
    city: String,
    device: String,
    type: String,
    birthday: Date,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAzyk'
    },
    patent: String,
    passport: String,
    notification: {
        type: Boolean,
        default: null
    },
    certificate: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    del: String,
}, {
    timestamps: true
});


const ClientAzyk = mongoose.model('ClientAzyk', ClientAzykSchema);

module.exports = ClientAzyk;