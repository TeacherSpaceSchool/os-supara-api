const mongoose = require('mongoose');

const ApplicationRouteOsSuparaSchema = mongoose.Schema({
    roles: [String],
    specialists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    }]
}, {
    timestamps: true
});


const ApplicationRouteOsSupara = mongoose.model('ApplicationRouteOsSupara', ApplicationRouteOsSuparaSchema);

module.exports = ApplicationRouteOsSupara;