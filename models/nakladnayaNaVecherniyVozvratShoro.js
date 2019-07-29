const mongoose = require('mongoose');

const NakladnayaNaVecherniyVozvratShoroSchema = mongoose.Schema({
    dataTable: String,

    data: String,
    organizator: String,
    region: String,
    guidRegion: String,
    guidOrganizator: String,
    disabled: Boolean,
}, {
    timestamps: true
});


const NakladnayaNaVecherniyVozvratShoro = mongoose.model('NakladnayaNaVecherniyVozvratShoro', NakladnayaNaVecherniyVozvratShoroSchema);

module.exports = NakladnayaNaVecherniyVozvratShoro;