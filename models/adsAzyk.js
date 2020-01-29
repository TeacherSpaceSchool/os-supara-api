const mongoose = require('mongoose');
const random = require('mongoose-random');

const AdsAzykSchema = mongoose.Schema({
    image: String,
    url: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    title: String
}, {
    timestamps: true
});

AdsAzykSchema.plugin(random, { path: 'r' });

const AdsAzyk = mongoose.model('AdsAzyk', AdsAzykSchema);

module.exports = AdsAzyk;