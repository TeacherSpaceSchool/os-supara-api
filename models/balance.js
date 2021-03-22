const mongoose = require('mongoose');

const BalanceOsSuparaSchema = mongoose.Schema({
    amount: [{
        name: String,
        value: Number
    }],
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    }
}, {
    timestamps: true
});

BalanceOsSuparaSchema.index({supplier: 1})


const BalanceOsSupara = mongoose.model('BalanceOsSupara', BalanceOsSuparaSchema);

module.exports = BalanceOsSupara;