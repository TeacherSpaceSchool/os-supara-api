const mongoose = require('mongoose');

const CategoryOsSuparaSchema = mongoose.Schema({
    name: String,
    del: String,
    GUID: String,
    suppliers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOsSupara'
    }]
}, {
    timestamps: true
});


const CategoryOsSupara = mongoose.model('CategoryOsSupara', CategoryOsSuparaSchema);

module.exports = CategoryOsSupara;