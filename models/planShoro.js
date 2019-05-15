const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const PlanShoroSchema = mongoose.Schema({
    norma: {
        type: Number,
        required: true,
    },
    regions: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
        unique: true
    },
    current: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
});

PlanShoroSchema.plugin(uniqueValidator);

const PlanShoro = mongoose.model('PlanShoro', PlanShoroSchema);

module.exports = PlanShoro;