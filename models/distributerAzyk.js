const mongoose = require('mongoose');

const DistributerAzykSchema = mongoose.Schema({
    distributer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    organizations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    }]
}, {
    timestamps: true
});


const DistributerAzyk = mongoose.model('DistributerAzyk', DistributerAzykSchema);

module.exports = DistributerAzyk;