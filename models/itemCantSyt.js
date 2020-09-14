const mongoose = require('mongoose');

const ItemCantSytSchema = mongoose.Schema({
    name: String,
    GUID: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryCantSyt'
    }
}, {
    timestamps: true
});

ItemCantSytSchema.index({name: 1})
ItemCantSytSchema.index({category: 1})
ItemCantSytSchema.index({GUID: 1})

const ItemCantSyt = mongoose.model('ItemCantSyt', ItemCantSytSchema);

module.exports = ItemCantSyt;