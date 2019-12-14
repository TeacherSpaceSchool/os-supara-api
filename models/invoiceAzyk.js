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
    usedBonus: Number,
    number: String,
    info: String,
    address: [String],
    paymentMethod: String,
    dateDelivery: Date,
    confirmationForwarder: Boolean,
    confirmationClient: Boolean,
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
}, {
    timestamps: true
});


const InvoiceAzyk = mongoose.model('InvoiceAzyk', InvoiceAzykSchema);

module.exports = InvoiceAzyk;