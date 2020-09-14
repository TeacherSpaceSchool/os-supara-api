const mongoose = require('mongoose');

const ApplicationRouteCantSytSchema = mongoose.Schema({
    roles: [String],
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DivisionCantSyt'
    },
}, {
    timestamps: true
});


const ApplicationRouteCantSyt = mongoose.model('ApplicationRouteCantSyt', ApplicationRouteCantSytSchema);

module.exports = ApplicationRouteCantSyt;