const mongoose = require('mongoose');

const MemorandumOsSuparaSchema = mongoose.Schema({
    status: String,
    number: String,
    name: String,
    comment: String,
    note: [String],
    term: Date,
    who: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    },
    whom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    },
    notifiables: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    }],
    routes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserOsSupara'
        },
        confirmation: Date,
        cancel: Date,
        comment: String
    }],
    dateClose: Date,
    approve: Boolean,
    completed: Boolean,
    checked: Boolean
}, {
    timestamps: true
});

MemorandumOsSuparaSchema.index({status: 1})
MemorandumOsSuparaSchema.index({who: 1})
MemorandumOsSuparaSchema.index({whom: 1})
MemorandumOsSuparaSchema.index({createdAt: 1})

const MemorandumOsSupara = mongoose.model('MemorandumOsSupara', MemorandumOsSuparaSchema);

module.exports = MemorandumOsSupara;