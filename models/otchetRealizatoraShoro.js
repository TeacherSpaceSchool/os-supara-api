const mongoose = require('mongoose');

const OtchetRealizatoraShoroSchema = mongoose.Schema({
    dataTable: String,

    data: String,
    realizator: String,
    organizator: String,
    region: String,
    point: String,
    guidRegion: String,
    guidOrganizator: String,
    guidPoint: String,
    guidRealizator: String,
    disabled: Boolean,
}, {
    timestamps: true
});


const OtchetRealizatoraShoro = mongoose.model('OtchetRealizatoraShoro', OtchetRealizatoraShoroSchema);

module.exports = OtchetRealizatoraShoro;