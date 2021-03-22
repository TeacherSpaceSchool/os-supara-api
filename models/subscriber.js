const mongoose = require('mongoose');

const SubscriberOsSuparaSchema = mongoose.Schema({
    endpoint: String,
    keys: mongoose.Schema.Types.Mixed,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    },
    number: String,
    status: String,
}, {
    timestamps: true
});

SubscriberOsSuparaSchema.index({user: 1})
SubscriberOsSuparaSchema.index({number: 1})

const SubscriberOsSupara = mongoose.model('SubscriberOsSupara', SubscriberOsSuparaSchema);

module.exports = SubscriberOsSupara;