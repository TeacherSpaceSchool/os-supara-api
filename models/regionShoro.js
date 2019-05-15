const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const RegionShoroSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

RegionShoroSchema.plugin(uniqueValidator);

const RegionShoro = mongoose.model('RegionShoro', RegionShoroSchema);

module.exports = RegionShoro;