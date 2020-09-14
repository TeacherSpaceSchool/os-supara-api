const mongoose = require('mongoose');

const DivisionCantSytSchema = mongoose.Schema({
    name: String,
    del: String,
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCantSyt'
    },
    suppliers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCantSyt'
    }],
    specialists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCantSyt'
    }],
}, {
    timestamps: true
});

DivisionCantSytSchema.index({name: 1})
DivisionCantSytSchema.index({del: 1})

const DivisionCantSyt = mongoose.model('DivisionCantSyt', DivisionCantSytSchema);

module.exports = DivisionCantSyt;