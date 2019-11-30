const mongoose = require('mongoose');

const InvoiceAzykSchema = mongoose.Schema({
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderAzyk'
    }],
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    },
    allPrice: Number,
    number: String,
    info: String,
    address: [String],
    paymentMethod: String,
    confirmationForwarder: Boolean,
    confirmationClient: Boolean,
}, {
    timestamps: true
});


const InvoiceAzyk = mongoose.model('InvoiceAzyk', InvoiceAzykSchema);

module.exports = InvoiceAzyk;