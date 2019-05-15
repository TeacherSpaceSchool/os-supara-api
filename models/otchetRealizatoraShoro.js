const mongoose = require('mongoose');

const OtchetRealizatoraShoroSchema = mongoose.Schema({
    dataTable: String,

    data: String,
    realizator: String,
    organizator: String,
    region: String,
    point: String,
    disabled: Boolean,
}, {
    timestamps: true
});


const OtchetRealizatoraShoro = mongoose.model('OtchetRealizatoraShoro', OtchetRealizatoraShoroSchema);

module.exports = OtchetRealizatoraShoro;