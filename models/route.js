const mongoose = require('mongoose');

const ApplicationRouteOsSuparaSchema = mongoose.Schema({
    roles: [String],
    division: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DivisionOsSupara'
    },
}, {
    timestamps: true
});


const ApplicationRouteOsSupara = mongoose.model('ApplicationRouteOsSupara', ApplicationRouteOsSuparaSchema);

module.exports = ApplicationRouteOsSupara;