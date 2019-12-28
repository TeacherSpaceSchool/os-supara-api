const mongoose = require('mongoose');

const RouteAzykSchema = mongoose.Schema({
    invoices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceAzyk'
    }],
    employment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
    status: String,
    number: String,
    dateStart: Date,
    dateEnd: Date,
    allTonnage: {
        type: Number,
        default: 0
    },
    allSize: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});


const RouteAzyk = mongoose.model('RouteAzyk', RouteAzykSchema);

module.exports = RouteAzyk;