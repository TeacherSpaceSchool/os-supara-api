const mongoose = require('mongoose');

const RoleOsSuparaSchema = mongoose.Schema({
    name: String,
}, {
    timestamps: true
});

RoleOsSuparaSchema.index({name: 1})

const RoleOsSupara = mongoose.model('RoleOsSupara', RoleOsSuparaSchema);

module.exports = RoleOsSupara;