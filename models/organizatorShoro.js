const mongoose = require('mongoose');

const OrganizatorShoroSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserShoro'
    },
}, {
    timestamps: true
});


const OrganizatorShoro = mongoose.model('OrganizatorShoro', OrganizatorShoroSchema);

module.exports = OrganizatorShoro;