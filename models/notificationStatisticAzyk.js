const mongoose = require('mongoose');

const NotificationStatisticAzykSchema = mongoose.Schema({
    tag: String,
    url: String,
    icon: String,
    title: String,
    text: String,
    delivered: Number,
    failed: Number,
    who: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAzyk'
    },
}, {
    timestamps: true
});


const NotificationStatisticAzyk = mongoose.model('NotificationStatisticAzyk', NotificationStatisticAzykSchema);

module.exports = NotificationStatisticAzyk;