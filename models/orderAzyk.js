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
    consignment: {
        type: Number,
        default: 0
    },
    consignmentPrice: {
        type: Number,
        default: 0
    },
    allPrice: Number,
    allTonnage: {
        type: Number,
        default: 0
    },
    allSize: {
        type: Number,
        default: 0
    },
    status: String,
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
    setRoute: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});


const OrderAzyk = mongoose.model('OrderAzyk', OrderAzykSchema);

module.exports = OrderAzyk;