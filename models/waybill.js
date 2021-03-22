const mongoose = require('mongoose');

const WaybillOsSuparaSchema = mongoose.Schema({
    status: String,
    number: String,
    dateClose: Date,
    acceptSpecialist: Date,
    comment: String,
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApplicationOsSupara'
    },
    seller: String,
    patent: [String],
    specialist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
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

WaybillOsSuparaSchema.index({status: 1})
WaybillOsSuparaSchema.index({number: 1})
WaybillOsSuparaSchema.index({dateClose: 1})
WaybillOsSuparaSchema.index({createdAt: 1})
WaybillOsSuparaSchema.index({application: 1})
WaybillOsSuparaSchema.index({specialist: 1})
WaybillOsSuparaSchema.index({supplier: 1})

const WaybillOsSupara = mongoose.model('WaybillOsSupara', WaybillOsSuparaSchema);

module.exports = WaybillOsSupara;