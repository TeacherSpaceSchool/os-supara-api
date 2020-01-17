const BonusClientAzyk = require('../models/bonusClientAzyk');

const type = `
  type BonusClient {
    _id: ID
    createdAt: Date
    current: Int
    addedBonus: Int
    bonus: Bonus
    client: Client
  }
`;

const query = `
    bonusesClient(search: String!, sort: String!): [BonusClient]
    bonusClient(_id: ID): BonusClient
    sortBonusClient: [Sort]
`;

const mutation = `
`;

const resolvers = {
    bonusesClient: async(parent, { search, sort}, {user}) => {
        let bonuses = [];
        if(user.role==='admin'){
            bonuses =  await BonusClientAzyk.find()
                .populate({
                    path: 'client',
                    match: {del: {$ne: 'deleted'}},
                    populate : [
                        {
                            path : 'user',
                        }
                    ]
                })
                .populate({
                    path: 'bonus',
                    populate : [
                        {
                            path : 'organization',
                            match: {del: {$ne: 'deleted'}}
                        }
                    ],
                })
                .sort(sort)
            bonuses = bonuses.filter(
                bonus =>
                {
                    return bonus.bonus.organization&&bonus.client&&(
                        ((bonus.client.phone.filter(phone => phone.toLowerCase()).includes(search.toLowerCase())).length > 0) ||
                        bonus.client.user&&(bonus.client.user.status.toLowerCase()).includes(search.toLowerCase())||
                        (bonus.client.name.toLowerCase()).includes(search.toLowerCase())||
                        (bonus.client.email.toLowerCase()).includes(search.toLowerCase())||
                        (bonus.client.city&&(bonus.client.city.toLowerCase()).includes(search.toLowerCase()))||
                        ((bonus.client.address.filter(addres=>addres[0].toLowerCase()).includes(search.toLowerCase())).length>0)||
                        (bonus.client.type.toLowerCase()).includes(search.toLowerCase())||
                        (bonus.client.info.toLowerCase()).includes(search.toLowerCase())||
                        (bonus.bonus.organization.name.toLowerCase()).includes(search.toLowerCase())
                    )
                }
            )
        }
        else if(['организация', 'менеджер', 'агент'].includes(user.role)){
            bonuses =  await BonusClientAzyk.find()
                .populate({
                    path: 'client',
                    match: {del: {$ne: 'deleted'}},
                    populate : [
                        {
                            path : 'user',
                        }
                    ]
                })
                .populate({
                    path: 'bonus',
                    populate : [
                        {
                            path : 'organization',
                            match: {status: 'active', _id: user.organization, del: {$ne: 'deleted'}}
                        }
                    ]
                })
                .sort(sort)
             bonuses = bonuses.filter(
                    bonus =>
                        bonus.bonus.organization&&bonus.client&&(
                            ((bonus.client.phone.filter(phone => phone.toLowerCase()).includes(search.toLowerCase())).length > 0) ||
                            bonus.client.user&&(bonus.client.user.status.toLowerCase()).includes(search.toLowerCase())||
                            (bonus.client.name.toLowerCase()).includes(search.toLowerCase())||
                            (bonus.client.email.toLowerCase()).includes(search.toLowerCase())||
                            (bonus.client.city.toLowerCase()).includes(search.toLowerCase())||
                            ((bonus.client.address.filter(addres=>addres[0].toLowerCase()).includes(search.toLowerCase())).length>0)||
                            (bonus.client.type.toLowerCase()).includes(search.toLowerCase())||
                            (bonus.client.info.toLowerCase()).includes(search.toLowerCase())
                        )
                )
        }
        else if(user.role==='client'){
            bonuses =  await BonusClientAzyk.find({client: user.client})
                .populate({
                    path: 'client',
                    match: {del: {$ne: 'deleted'}},
                    populate : [
                        {
                            path : 'user'
                        }
                    ]
                })
                .populate({
                    path: 'bonus',
                    populate : [
                        {
                            path : 'organization',
                            match: {status: 'active', del: {$ne: 'deleted'}}
                        }
                    ]
                })
                .sort(sort)
            bonuses = bonuses.filter(
                    bonus =>
                        (
                            bonus.client&&bonus.bonus.organization&&(bonus.bonus.organization.name.toLowerCase()).includes(search.toLowerCase())
                        )
                )
        }
        return bonuses
    },
    bonusClient: async(parent, {_id}, {user}) => {
        let bonus;
        if(user.role==='admin'){
            bonus =  await BonusClientAzyk.findOne({_id: _id})
                .populate({
                    path: 'client',
                    populate : [
                        {
                            path : 'user'
                        }
                    ]
                })
                .populate({
                    path: 'bonus',
                    populate : [
                        {
                            path : 'organization',
                            match: {status: 'active'}
                        }
                    ]
                })
        }
        else if(['организация', 'менеджер', 'агент'].includes(user.role)){
            bonus =  await BonusClientAzyk.findOne()
                .populate({
                    path: 'client',
                    populate : [
                        {
                            path : 'user'
                        }
                    ]
                })
                .populate({
                    path: 'bonus',
                    populate : [
                        {
                            path : 'organization',
                            match: {_id: user.organization}
                        }
                    ]
                })
        }
        else if(!user.role||user.role==='client'){
            bonus =  await BonusClientAzyk.find({_id: _id, client: user.client})
                .populate({
                    path: 'client',
                    populate : [
                        {
                            path : 'user'
                        }
                    ]
                })
                .populate({
                    path: 'bonus',
                    populate : [
                        {
                            path : 'organization',
                            match: {status: 'active'}
                        }
                    ]
                })
            if(!bonus.bonus.organization)
                bonus = null
        }
        return bonus
    },
    sortBonusClient: async(parent, ctx, {user}) => {
        if(!user.role||['admin', 'client'].includes(user.role))
            return [
                {
                    name: 'Прогресс',
                    field: 'current'
                },
                {
                    name: 'Бонус',
                    field: 'addedBonus'
                }
            ];
        else
            return []
    }
};

const resolversMutation = {
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;