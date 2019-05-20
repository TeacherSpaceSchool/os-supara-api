const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const PointShoroSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    region: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

PointShoroSchema.plugin(uniqueValidator);

const PointShoro = mongoose.model('PointShoro', PointShoroSchema);

module.exports = PointShoro;