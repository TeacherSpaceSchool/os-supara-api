const mongoose = require('mongoose');

const StorageOsSuparaSchema = mongoose.Schema({
    count: Number,
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemOsSupara'
    }
}, {
    timestamps: true
});

StorageOsSuparaSchema.index({item: 1})


const StorageOsSupara = mongoose.model('StorageOsSupara', StorageOsSuparaSchema);

module.exports = StorageOsSupara;