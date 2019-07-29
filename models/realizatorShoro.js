const mongoose = require('mongoose');

const RealizatorShoroSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    point: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserShoro'
    },
    guidRegion: {
        type: String,
        required: true,
    },
    guidPoint: {
        type: String,
        required: true,
    },
    guid: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});


const RealizatorShoro = mongoose.model('RealizatorShoro', RealizatorShoroSchema);

module.exports = RealizatorShoro;