const mongoose = require('mongoose');

const outXMLReturnedShoroSchema = mongoose.Schema({
    data: mongoose.Schema.Types.Mixed,
    guid: String,
    date: Date,
    number: String,
    client: String,
    agent: String,
    forwarder: String,
    returned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReturnedAzyk'
    },
    status: String
}, {
    timestamps: true
});


const outXMLReturnedShoro = mongoose.model('outXMLReturnedShoro', outXMLReturnedShoroSchema);

module.exports = outXMLReturnedShoro;