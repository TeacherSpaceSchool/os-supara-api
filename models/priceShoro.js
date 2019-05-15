const mongoose = require('mongoose');

const PriceShoroSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});


const PriceShoro = mongoose.model('PriceShoro', PriceShoroSchema);

module.exports = PriceShoro;