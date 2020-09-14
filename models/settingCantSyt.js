const mongoose = require('mongoose');

const SettingCantSytSchema = mongoose.Schema({
    supplier: {
        type: String,
        default: 'подразделение'
    },
}, {
    timestamps: true
});

const SettingCantSyt = mongoose.model('SettingCantSyt', SettingCantSytSchema);

module.exports = SettingCantSyt;