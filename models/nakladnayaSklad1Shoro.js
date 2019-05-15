const mongoose = require('mongoose');

const NakladnayaSklad1ShoroSchema = mongoose.Schema({
    dataTable: String,

    data: String,
    organizator: String,
    region: String,
    disabled: Boolean,
}, {
    timestamps: true
});


const NakladnayaSklad1Shoro = mongoose.model('NakladnayaSklad1Shoro', NakladnayaSklad1ShoroSchema);

module.exports = NakladnayaSklad1Shoro;