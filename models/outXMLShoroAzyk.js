const mongoose = require('mongoose');

const outXMLShoroSchema = mongoose.Schema({
    data: mongoose.Schema.Types.Mixed,
    guid: String,
    date: Date,
    number: String,
    client: String,
    agent: String,
    forwarder: String,
    exc: String,
    adss: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdsAzyk'
    }],
    track: {
        type: Number,
        default: 1
    },
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceAzyk'
    },
    status: String
}, {
    timestamps: true
});


const outXMLShoro = mongoose.model('outXMLShoro', outXMLShoroSchema);

module.exports = outXMLShoro;