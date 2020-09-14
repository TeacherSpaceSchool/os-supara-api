const mongoose = require('mongoose');

const ExpenseReportCantSytSchema = mongoose.Schema({
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
        ref: 'ApplicationCantSyt'
    }],
    waybills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WaybillCantSyt'
    }],
    cashConsumables: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CashConsumableCantSyt'
    }],
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCantSyt'
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

ExpenseReportCantSytSchema.index({status: 1})
ExpenseReportCantSytSchema.index({number: 1})
ExpenseReportCantSytSchema.index({createdAt: 1})
ExpenseReportCantSytSchema.index({application: 1})
ExpenseReportCantSytSchema.index({dateClose: 1})
ExpenseReportCantSytSchema.index({supplier: 1})

const ExpenseReportCantSyt = mongoose.model('ExpenseReportCantSyt', ExpenseReportCantSytSchema);

module.exports = ExpenseReportCantSyt;