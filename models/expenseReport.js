const mongoose = require('mongoose');

const ExpenseReportOsSuparaSchema = mongoose.Schema({
    status: String,
    number: String,
    GUID: String,
    dateClose: Date,
    acceptHead: Date,
    sync: {
        type: Number,
        default: 0
    },
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApplicationOsSupara'
    }],
    cashExchanges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CashExchangeOsSupara'
    }],
    waybills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WaybillOsSupara'
    }],
    cashConsumables: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CashConsumableOsSupara'
    }],
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    },
    balanceStart: [{
        name: String,
        value: Number
    }],
    receivedAmount: [{
        name: String,
        value: Number
    }],
    expense: [{
        name: String,
        value: Number
    }],
    overExpense: [{
        name: String,
        value: Number
    }],
    outCashbox: [{
        name: String,
        value: Number
    }],
    balanceEnd: [{
        name: String,
        value: Number
    }],
    addedItems: [{
        name: String,
        unit: String,
        price: Number,
        count: Number,
        specification: String,
        currency: String,
        comment: String,
        status: String,
        GUID: String,
    }],
}, {
    timestamps: true
});

ExpenseReportOsSuparaSchema.index({status: 1})
ExpenseReportOsSuparaSchema.index({number: 1})
ExpenseReportOsSuparaSchema.index({createdAt: 1})
ExpenseReportOsSuparaSchema.index({application: 1})
ExpenseReportOsSuparaSchema.index({dateClose: 1})
ExpenseReportOsSuparaSchema.index({supplier: 1})

const ExpenseReportOsSupara = mongoose.model('ExpenseReportOsSupara', ExpenseReportOsSuparaSchema);

module.exports = ExpenseReportOsSupara;