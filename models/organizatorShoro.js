const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const OrganizatorShoroSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
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

OrganizatorShoroSchema.plugin(uniqueValidator);

const OrganizatorShoro = mongoose.model('OrganizatorShoro', OrganizatorShoroSchema);

module.exports = OrganizatorShoro;