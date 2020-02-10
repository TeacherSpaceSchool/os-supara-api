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
    consignmentPrice: {
        type: Number,
        default: 0
    },
    allTonnage: {
        type: Number,
        default: 0
    },
    allSize: {
        type: Number,
        default: 0
    },
    usedBonus: Number,
    number: String,
    info: String,
    address: [String],
    paymentMethod: String,
    dateDelivery: Date,
    confirmationForwarder: Boolean,
    confirmationClient: Boolean,
    paymentConsignation: Boolean,
    cancelClient: Date,
    cancelForwarder: Date,
    taken: Boolean,
    del: String,
    editor: String,
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
}, {
    timestamps: true
});


const InvoiceAzyk = mongoose.model('InvoiceAzyk', InvoiceAzykSchema);

module.exports = InvoiceAzyk;