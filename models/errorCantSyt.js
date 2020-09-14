const mongoose = require('mongoose');

const ErrorCantSytSchema = mongoose.Schema({
    err: String,
    path: String,
}, {
    timestamps: true
});

const ErrorCantSyt = mongoose.model('ErrorCantSyt', ErrorCantSytSchema);

module.exports = ErrorCantSyt;