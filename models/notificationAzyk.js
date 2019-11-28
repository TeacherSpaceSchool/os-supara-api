const mongoose = require('mongoose');

const NotificationAzykSchema = mongoose.Schema({
    title: String,
    text: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAzyk'
    },
}, {
    timestamps: true
});


const NotificationAzyk = mongoose.model('NotificationAzyk', NotificationAzykSchema);

module.exports = NotificationAzyk;