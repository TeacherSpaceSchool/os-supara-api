const mongoose = require('mongoose');

const ReviewAzykSchema = mongoose.Schema({
    what: mongoose.Schema.Types.ObjectId,
    likes: Number,
    dislikes: Number,
    image: Number,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    },
    status: String,
}, {
    timestamps: true
});


const ReviewAzyk = mongoose.model('ReviewAzyk', ReviewAzykSchema);

module.exports = ReviewAzyk;