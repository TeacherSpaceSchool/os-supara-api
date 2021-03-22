const mongoose = require('mongoose');

const SettingOsSuparaSchema = mongoose.Schema({
    lang: {
        type: String,
        default: 'RU'
    },
}, {
    timestamps: true
});

const SettingOsSupara = mongoose.model('SettingOsSupara', SettingOsSuparaSchema);

module.exports = SettingOsSupara;