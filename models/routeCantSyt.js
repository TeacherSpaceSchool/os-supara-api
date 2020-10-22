const mongoose = require('mongoose');

const ApplicationRouteCantSytSchema = mongoose.Schema({
    roles: [String],
    specialists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCantSyt'
    }],
}, {
    timestamps: true
});


const ApplicationRouteCantSyt = mongoose.model('ApplicationRouteCantSyt', ApplicationRouteCantSytSchema);

module.exports = ApplicationRouteCantSyt;