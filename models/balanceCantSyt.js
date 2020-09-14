const mongoose = require('mongoose');

const BalanceCantSytSchema = mongoose.Schema({
    amount: [{
        name: String,
        value: Number
    }],
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCantSyt'
    }
}, {
    timestamps: true
});

BalanceCantSytSchema.index({supplier: 1})


const BalanceCantSyt = mongoose.model('BalanceCantSyt', BalanceCantSytSchema);

module.exports = BalanceCantSyt;