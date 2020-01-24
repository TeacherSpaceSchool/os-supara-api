const mongoose = require('mongoose');

const OrganizationAzykSchema = mongoose.Schema({
    name: String,
    image: String,
    address: [String],
    email: [String],
    phone: [String],
    info: String,
    reiting: Number,
    status: String,
    minimumOrder: Number,
    del: String,
    accessToClient: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});


const OrganizationAzyk = mongoose.model('OrganizationAzyk', OrganizationAzykSchema);

module.exports = OrganizationAzyk;