const mongoose = require('mongoose');

const BonusAzykSchema = mongoose.Schema({
    target: Number,
    bonus: Number,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
}, {
    timestamps: true
});


const BonusAzyk = mongoose.model('BonusAzyk', BonusAzykSchema);

module.exports = BonusAzyk;