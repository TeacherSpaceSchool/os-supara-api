const mongoose = require('mongoose');

const ItemAzykSchema = mongoose.Schema({
    guid: String,
    stock: Number,
    name: String,
    image: String,
    price: Number,
    reiting: Number,
    deliveryDays: [String],
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategoryAzyk'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    hit: Boolean,
    latest: Boolean,
    status: String,
    info: String,
    favorite: [mongoose.Schema.Types.ObjectId],
    basket: [mongoose.Schema.Types.ObjectId],
}, {
    timestamps: true
});


const ItemAzyk = mongoose.model('ItemAzyk', ItemAzykSchema);

module.exports = ItemAzyk;