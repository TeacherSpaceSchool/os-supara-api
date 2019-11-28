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
}, {
    timestamps: true
});


const RouteAzyk = mongoose.model('RouteAzyk', RouteAzykSchema);

module.exports = RouteAzyk;