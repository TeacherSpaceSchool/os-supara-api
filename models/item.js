const mongoose = require('mongoose');

const ItemOsSuparaSchema = mongoose.Schema({
    sync: Number,
    name: String,
    GUID: String,
    lastPrice: [{
        name: String,
        value: Number
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryOsSupara'
    }
}, {
    timestamps: true
});

ItemOsSuparaSchema.index({name: 1})
ItemOsSuparaSchema.index({category: 1})
ItemOsSuparaSchema.index({GUID: 1})

const ItemOsSupara = mongoose.model('ItemOsSupara', ItemOsSuparaSchema);

module.exports = ItemOsSupara;