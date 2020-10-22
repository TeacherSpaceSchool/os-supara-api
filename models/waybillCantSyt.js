const mongoose = require('mongoose');

const WaybillCantSytSchema = mongoose.Schema({
    status: String,
    number: String,
    dateClose: Date,
    acceptSpecialist: Date,
    comment: String,
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApplicationCantSyt'
    },
    seller: String,
    patent: String,
    specialist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCantSyt'
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCantSyt'
    },
    items: [{
        name: String,
        unit: String,
        price: Number,
        count: Number,
        specification: String,
        currency: String,
        comment: String,
        status: String,
        GUID: String,
    }],
    amount: [{
        name: String,
        value: Number
    }],
}, {
    timestamps: true
});

WaybillCantSytSchema.index({status: 1})
WaybillCantSytSchema.index({number: 1})
WaybillCantSytSchema.index({dateClose: 1})
WaybillCantSytSchema.index({createdAt: 1})
WaybillCantSytSchema.index({application: 1})
WaybillCantSytSchema.index({specialist: 1})
WaybillCantSytSchema.index({supplier: 1})

const WaybillCantSyt = mongoose.model('WaybillCantSyt', WaybillCantSytSchema);

module.exports = WaybillCantSyt;