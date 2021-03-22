const mongoose = require('mongoose');

const CashConsumableOsSuparaSchema = mongoose.Schema({
    GUID: String,
    number: String,
    currencyType: String,
    dateClose: Date,
    amount: Number,
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
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

CashConsumableOsSuparaSchema.index({number: 1})
CashConsumableOsSuparaSchema.index({dateClose: 1})
CashConsumableOsSuparaSchema.index({createdAt: 1})
CashConsumableOsSuparaSchema.index({amount: 1})
CashConsumableOsSuparaSchema.index({supplier: 1})
CashConsumableOsSuparaSchema.index({status: 1})

const CashConsumableOsSupara = mongoose.model('CashConsumableOsSupara', CashConsumableOsSuparaSchema);

module.exports = CashConsumableOsSupara;