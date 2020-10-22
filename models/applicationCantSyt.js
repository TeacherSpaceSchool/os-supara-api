const mongoose = require('mongoose');

const ApplicationCantSytSchema = mongoose.Schema({
    status: String,
    number: String,
    subdivision: String,
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DivisionCantSyt'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryCantSyt'
    },
    budget: {
        type: Boolean,
        default: true
    },
    note: String,
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
    routes: [{
        role: String,
        confirmation: Date,
        cancel: Date,
        comment: String
    }],
}, {
    timestamps: true
});

ApplicationCantSytSchema.index({status: 1})
ApplicationCantSytSchema.index({number: 1})
ApplicationCantSytSchema.index({division: 1})
ApplicationCantSytSchema.index({category: 1})
ApplicationCantSytSchema.index({dateClose: 1})
ApplicationCantSytSchema.index({term: 1})
ApplicationCantSytSchema.index({specialist: 1})
ApplicationCantSytSchema.index({supplier: 1})
ApplicationCantSytSchema.index({routes: 1})
ApplicationCantSytSchema.index({createdAt: 1})

const ApplicationCantSyt = mongoose.model('ApplicationCantSyt', ApplicationCantSytSchema);

module.exports = ApplicationCantSyt;