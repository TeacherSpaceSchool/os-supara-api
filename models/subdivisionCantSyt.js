const mongoose = require('mongoose');

const SubdivisionCantSytSchema = mongoose.Schema({
    name: String,
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DivisionCantSyt'
    }
}, {
    timestamps: true
});

SubdivisionCantSytSchema.index({name: 1})

const SubdivisionCantSyt = mongoose.model('SubdivisionCantSyt', SubdivisionCantSytSchema);

module.exports = SubdivisionCantSyt;