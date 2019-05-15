const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const CarShoroSchema = mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

CarShoroSchema.plugin(uniqueValidator);

const CarShoro = mongoose.model('CarShoro', CarShoroSchema);

module.exports = CarShoro;