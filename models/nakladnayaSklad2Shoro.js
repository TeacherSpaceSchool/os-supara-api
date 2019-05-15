const mongoose = require('mongoose');

const NakladnayaSklad2ShoroSchema = mongoose.Schema({
    dataTable: String,

    data: String,
    organizator: String,
    region: String,
    disabled: Boolean,
}, {
    timestamps: true
});


const NakladnayaSklad2Shoro = mongoose.model('NakladnayaSklad2Shoro', NakladnayaSklad2ShoroSchema);

module.exports = NakladnayaSklad2Shoro;