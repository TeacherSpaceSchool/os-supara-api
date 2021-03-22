const mongoose = require('mongoose');

const SellerOsSuparaSchema = mongoose.Schema({
    name: String,
    address: String,
    phone: String
}, {
    timestamps: true
});

SellerOsSuparaSchema.index({name: 1})

const SellerOsSupara = mongoose.model('SellerOsSupara', SellerOsSuparaSchema);

module.exports = SellerOsSupara;