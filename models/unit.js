const mongoose = require('mongoose');

const UnitOsSuparaSchema = mongoose.Schema({
    name: String
}, {
    timestamps: true
});

UnitOsSuparaSchema.index({name: 1})

const UnitOsSupara = mongoose.model('UnitOsSupara', UnitOsSuparaSchema);

module.exports = UnitOsSupara;