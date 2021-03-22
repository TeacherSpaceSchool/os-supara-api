const mongoose = require('mongoose');

const AutoApplicationOsSuparaSchema = mongoose.Schema({
    roles: [String],
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DivisionOsSupara'
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    },
    specialist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    },
    items: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});


const AutoApplicationOsSupara = mongoose.model('AutoApplicationOsSupara', AutoApplicationOsSuparaSchema);

module.exports = AutoApplicationOsSupara;