const mongoose = require('mongoose');

const PustayaTaraShoroSchema = mongoose.Schema({
    dataTable: String,

    data: String,
    organizator: String,
    region: String,
    disabled: Boolean,
}, {
    timestamps: true
});


const PustayaTaraShoro = mongoose.model('PustayaTaraShoro', PustayaTaraShoroSchema);

module.exports = PustayaTaraShoro;