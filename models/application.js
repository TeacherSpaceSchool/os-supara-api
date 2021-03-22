const mongoose = require('mongoose');

const ApplicationOsSuparaSchema = mongoose.Schema({
    status: String,
    number: String,
    subdivision: String,
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DivisionOsSupara'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryOsSupara'
    },
    budget: {
        type: Boolean,
        default: true
    },
    note: [String],
    paymentType:  {
        type: String,
        default: 'наличные'
    },
    official: {
        type: Boolean,
        default: true
    },
    comment: {
        type: String,
        default: ''
    },
    dateClose: Date,
    amount: [{
        name: String,
        value: Number
    }],
    term: Date,
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
    routes: [{
        role: String,
        confirmation: Date,
        cancel: Date,
        comment: String
    }],
}, {
    timestamps: true
});

ApplicationOsSuparaSchema.index({status: 1})
ApplicationOsSuparaSchema.index({number: 1})
ApplicationOsSuparaSchema.index({division: 1})
ApplicationOsSuparaSchema.index({category: 1})
ApplicationOsSuparaSchema.index({dateClose: 1})
ApplicationOsSuparaSchema.index({term: 1})
ApplicationOsSuparaSchema.index({specialist: 1})
ApplicationOsSuparaSchema.index({supplier: 1})
ApplicationOsSuparaSchema.index({routes: 1})
ApplicationOsSuparaSchema.index({createdAt: 1})

const ApplicationOsSupara = mongoose.model('ApplicationOsSupara', ApplicationOsSuparaSchema);

module.exports = ApplicationOsSupara;