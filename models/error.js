const mongoose = require('mongoose');

const ErrorOsSuparaSchema = mongoose.Schema({
    err: String,
    path: String,
}, {
    timestamps: true
});

const ErrorOsSupara = mongoose.model('ErrorOsSupara', ErrorOsSuparaSchema);

module.exports = ErrorOsSupara;