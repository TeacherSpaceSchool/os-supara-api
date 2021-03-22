const mongoose = require('mongoose');

const FaqOsSuparaSchema = mongoose.Schema({
    url: String,
    title: String,
    video: String,
}, {
    timestamps: true
});

FaqOsSuparaSchema.index({title: 1})

const FaqOsSupara = mongoose.model('FaqOsSupara', FaqOsSuparaSchema);

module.exports = FaqOsSupara;