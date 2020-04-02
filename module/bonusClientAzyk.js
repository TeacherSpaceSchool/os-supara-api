const BonusClientAzyk = require('../models/bonusClientAzyk');
const BonusAzyk = require('../models/bonusAzyk');

module.exports.addBonusToClient = async(client, organization, cash) => {
    let bonus = await BonusAzyk.findOne({organization: organization});
    let bonusClient = await BonusClientAzyk.findOne({client: client, bonus: bonus._id});
    if(bonus){
        if(!bonusClient){
            let _object = new BonusClientAzyk({
                current: cash,
                addedBonus: 0,
                bonus: bonus._id,
                client: client,
            });
            if(_object.current>bonus.target&&!_object.added) {
                _object.addedBonus += bonus.bonus
                _object.added = true
            }
            await BonusClientAzyk.create(_object)
        } else {
            bonusClient.current+=cash
            if(bonusClient.current>bonus.target&&!bonusClient.added) {
                bonusClient.addedBonus += bonus.bonus
                bonusClient.added = true
            }
            await bonusClient.save();
        }
    }
}