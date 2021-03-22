const SettingOsSupara = require('../models/setting');

module.exports.createSetting = async() => {
    let setting = await SettingOsSupara.findOne()
    if(!setting) {
        setting = new SettingOsSupara({
            lang: 'RU'
        });
        await SettingOsSupara.create(setting)
    }

}