const mongoose = require('mongoose');

const EmploymentAzykSchema = mongoose.Schema({
    name: String,
    email: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAzyk'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
}, {
    timestamps: true
});


const EmploymentAzyk = mongoose.model('EmploymentAzyk', EmploymentAzykSchema);

module.exports = EmploymentAzyk;