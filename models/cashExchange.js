const mongoose = require('mongoose');

const CashExchangeOsSuparaSchema = mongoose.Schema({
    GUID: String,
    number: String,
    exchangeFrom: Number,
    sync: Number,
    currencyTypeFrom: String,
    exchangeTo: Number,
    currencyTypeTo: String,
    currencyTypeRate: String,
    exchangeRate: Number,
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    },
    comment: {
        type: String,
        default: ''
    },
    note: [String]
}, {
    timestamps: true
});

CashExchangeOsSuparaSchema.index({number: 1})
CashExchangeOsSuparaSchema.index({createdAt: 1})
CashExchangeOsSuparaSchema.index({supplier: 1})

const CashExchangeOsSupara = mongoose.model('CashExchangeOsSupara', CashExchangeOsSuparaSchema);

module.exports = CashExchangeOsSupara;