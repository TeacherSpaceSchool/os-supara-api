const mongoose = require('mongoose');

const noteXMLShoroSchema = mongoose.Schema({
    guid: String,
    status: String,
    type: String,
    phone: String,
    name: String,
    address: String,
    price: String,
    package: String,
    check: Boolean,
}, {
    timestamps: true
});


const noteXMLShoro = mongoose.model('noteXMLShoro', noteXMLShoroSchema);

module.exports = noteXMLShoro;