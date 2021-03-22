const mongoose = require('mongoose');

const BalanceHistoryOsSuparaSchema = mongoose.Schema({
    removeAmount: String,
    addAmount: String,
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    }
}, {
    timestamps: true
});

BalanceHistoryOsSuparaSchema.index({supplier: 1})


const BalanceHistoryOsSupara = mongoose.model('BalanceHistoryOsSupara', BalanceHistoryOsSuparaSchema);

module.exports = BalanceHistoryOsSupara;