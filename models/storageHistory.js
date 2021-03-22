const mongoose = require('mongoose');

const StorageHistoryOsSuparaSchema = mongoose.Schema({
    count: String,
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemOsSupara'
    }
}, {
    timestamps: true
});

StorageHistoryOsSuparaSchema.index({item: 1})

const StorageHistoryOsSupara = mongoose.model('StorageHistoryOsSupara', StorageHistoryOsSuparaSchema);

module.exports = StorageHistoryOsSupara;