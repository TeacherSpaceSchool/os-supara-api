const mongoose = require('mongoose');

const FaqCantSytSchema = mongoose.Schema({
    url: String,
    title: String,
    video: String,
}, {
    timestamps: true
});

FaqCantSytSchema.index({title: 1})

const FaqCantSyt = mongoose.model('FaqCantSyt', FaqCantSytSchema);

module.exports = FaqCantSyt;