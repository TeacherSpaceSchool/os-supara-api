const mongoose = require('mongoose');

const NakladnayaNaVecherniyVozvratShoroSchema = mongoose.Schema({
    dataTable: String,

    data: String,
    organizator: String,
    region: String,
    disabled: Boolean,
}, {
    timestamps: true
});


const NakladnayaNaVecherniyVozvratShoro = mongoose.model('NakladnayaNaVecherniyVozvratShoro', NakladnayaNaVecherniyVozvratShoroSchema);

module.exports = NakladnayaNaVecherniyVozvratShoro;