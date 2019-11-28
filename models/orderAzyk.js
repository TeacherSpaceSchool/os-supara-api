const mongoose = require('mongoose');

const OrderAzykSchema = mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemAzyk'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    },
    count: Number,
    allPrice: Number,
    status: String,
}, {
    timestamps: true
});


const OrderAzyk = mongoose.model('OrderAzyk', OrderAzykSchema);

module.exports = OrderAzyk;