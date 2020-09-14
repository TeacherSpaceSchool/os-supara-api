const mongoose = require('mongoose');

const SubscriberCantSytSchema = mongoose.Schema({
    endpoint: String,
    keys: mongoose.Schema.Types.Mixed,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCantSyt'
    },
    number: String,
    status: String,
}, {
    timestamps: true
});

SubscriberCantSytSchema.index({user: 1})
SubscriberCantSytSchema.index({number: 1})

const SubscriberCantSyt = mongoose.model('SubscriberCantSyt', SubscriberCantSytSchema);

module.exports = SubscriberCantSyt;