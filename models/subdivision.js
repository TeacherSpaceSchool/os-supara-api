const mongoose = require('mongoose');

const SubdivisionOsSuparaSchema = mongoose.Schema({
    name: String,
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DivisionOsSupara'
    }
}, {
    timestamps: true
});

SubdivisionOsSuparaSchema.index({name: 1})

const SubdivisionOsSupara = mongoose.model('SubdivisionOsSupara', SubdivisionOsSuparaSchema);

module.exports = SubdivisionOsSupara;