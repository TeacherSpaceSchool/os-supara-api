const OrganizationAzyk = require('../models/organizationAzyk');
const BonusAzyk = require('../models/bonusAzyk');

module.exports.reductionToBonus = async() => {
    let organizationsBonus = await BonusAzyk.find().distinct('organization')
    let organizations = await OrganizationAzyk.find({
        _id: {$nin: organizationsBonus},
        status: 'active',
        del: {$ne: 'deleted'}
    })
    console.log(`reductionToBonus: ${organizations.length}`)
    for(let i = 0; i<organizations.length;i++){
        let objectBonus = new BonusAzyk({
            target: 0,
            bonus: 0,
            organization: organizations[i]._id
        });
        await BonusAzyk.create(objectBonus)
    }
}