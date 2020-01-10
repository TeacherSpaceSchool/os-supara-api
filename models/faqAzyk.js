const mongoose = require('mongoose');

const FaqAzykSchema = mongoose.Schema({
    url: String,
    title: String
}, {
    timestamps: true
});

const FaqAzyk = mongoose.model('FaqAzyk', FaqAzykSchema);

module.exports = FaqAzyk;