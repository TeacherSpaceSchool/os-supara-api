const mongoose = require('mongoose');

const UnitCantSytSchema = mongoose.Schema({
    name: String
}, {
    timestamps: true
});

UnitCantSytSchema.index({name: 1})

const UnitCantSyt = mongoose.model('UnitCantSyt', UnitCantSytSchema);

module.exports = UnitCantSyt;