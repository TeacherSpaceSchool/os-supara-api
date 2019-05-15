const mongoose = require('mongoose');

const ZavSkladShoroSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserShoro'
    },
}, {
    timestamps: true
});


const ZavSkladShoro = mongoose.model('ZavSkladShoro', ZavSkladShoroSchema);

module.exports = ZavSkladShoro;