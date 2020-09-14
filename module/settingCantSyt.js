const SettingCantSyt = require('../models/settingCantSyt');

module.exports.createSetting = async() => {
    let setting = await SettingCantSyt.findOne()
    if(!setting) {
        setting = new SettingCantSyt({
            supplier: 'подразделение'
        });
        await SettingCantSyt.create(setting)
    }

}