const mongoose = require('mongoose');

const PointShoroSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const PointShoro = mongoose.model('PointShoro1', PointShoroSchema);

module.exports = PointShoro;