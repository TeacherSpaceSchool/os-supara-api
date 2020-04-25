const mongoose = require('mongoose');

const ErrorAzykSchema = mongoose.Schema({
    data: String,
}, {
    timestamps: true
});

const ErrorAzyk = mongoose.model('ErrorAzyk', ErrorAzykSchema);

module.exports = ErrorAzyk;