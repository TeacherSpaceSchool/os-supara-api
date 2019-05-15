const mongoose = require('mongoose');

const OtchetOrganizatoraShoroSchema = mongoose.Schema({
    dataTable: String,

    data: String,
    organizator: String,
    region: String,
    disabled: Boolean,
}, {
    timestamps: true
});


const OtchetOrganizatoraShoro = mongoose.model('OtchetOrganizatoraShoro', OtchetOrganizatoraShoroSchema);

module.exports = OtchetOrganizatoraShoro;