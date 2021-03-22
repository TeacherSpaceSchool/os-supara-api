const mongoose = require('mongoose');

const DivisionOsSuparaSchema = mongoose.Schema({
    name: String,
    del: String,
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    },
    suppliers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    }],
    specialists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    }],
    staffs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    }],
}, {
    timestamps: true
});

DivisionOsSuparaSchema.index({name: 1})
DivisionOsSuparaSchema.index({del: 1})

const DivisionOsSupara = mongoose.model('DivisionOsSupara', DivisionOsSuparaSchema);

module.exports = DivisionOsSupara;