const mongoose = require('mongoose');

const Balance1CHistryOsSuparaSchema = mongoose.Schema({
    amount: [String],
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    }
}, {
    timestamps: true
});

Balance1CHistryOsSuparaSchema.index({supplier: 1})


const Balance1CHistryOsSupara = mongoose.model('Balance1CHistryOsSupara', Balance1CHistryOsSuparaSchema);

module.exports = Balance1CHistryOsSupara;