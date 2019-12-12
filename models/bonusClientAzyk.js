const mongoose = require('mongoose');

const BonusClientAzykSchema = mongoose.Schema({
    current: Number,
    addedBonus: Number,
    added: Boolean,
    bonus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BonusAzyk'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    },
}, {
    timestamps: true
});


const BonusClientAzyk = mongoose.model('BonusClientAzyk', BonusClientAzykSchema);

module.exports = BonusClientAzyk;