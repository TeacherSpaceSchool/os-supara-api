const mongoose = require('mongoose');

const RoleCantSytSchema = mongoose.Schema({
    name: String,
}, {
    timestamps: true
});

RoleCantSytSchema.index({name: 1})

const RoleCantSyt = mongoose.model('RoleCantSyt', RoleCantSytSchema);

module.exports = RoleCantSyt;