const mongoose = require('mongoose');

const outXMLShoroSchema = mongoose.Schema({
    data: mongoose.Schema.Types.Mixed,
    guid: String,
    date: Date,
    number: String,
    client: String,
    agent: String,
    forwarder: String,
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