const mongoose = require('mongoose');

const Balance1COsSuparaSchema = mongoose.Schema({
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

Balance1COsSuparaSchema.index({supplier: 1})


const Balance1COsSupara = mongoose.model('Balance1COsSupara', Balance1COsSuparaSchema);

module.exports = Balance1COsSupara;