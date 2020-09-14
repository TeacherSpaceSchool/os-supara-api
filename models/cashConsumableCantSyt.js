const mongoose = require('mongoose');

const CashConsumableCantSytSchema = mongoose.Schema({
    GUID: String,
    number: String,
    currencyType: String,
    dateClose: Date,
    amount: Number,
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCantSyt'
    },
    comment: {
        type: String,
        default: ''
    },
    budget: {
        type: String,
        default: ''
    },
}, {
    timestamps: true
});

CashConsumableCantSytSchema.index({number: 1})
CashConsumableCantSytSchema.index({dateClose: 1})
CashConsumableCantSytSchema.index({createdAt: 1})
CashConsumableCantSytSchema.index({amount: 1})
CashConsumableCantSytSchema.index({supplier: 1})
CashConsumableCantSytSchema.index({status: 1})

const CashConsumableCantSyt = mongoose.model('CashConsumableCantSyt', CashConsumableCantSytSchema);

module.exports = CashConsumableCantSyt;