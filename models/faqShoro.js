const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const FaqShoroSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    text: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

FaqShoroSchema.plugin(uniqueValidator);

const FaqShoro = mongoose.model('FaqShoro', FaqShoroSchema);

module.exports = FaqShoro;