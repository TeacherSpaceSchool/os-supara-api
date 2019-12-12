const BonusAzyk = require('../models/bonusAzyk');

const type = `
  type Bonus {
    _id: ID
    createdAt: Date
    target: Int
    bonus: Int
    organization: Organization
  }
`;

const query = `
    bonuses(search: String!, sort: String!): [Bonus]
    bonus(_id: ID): Bonus
    sortBonus: [Sort]
`;

const mutation = `
    setBonus(_id: ID!, target: Int!, bonus: Int!): Data
`;

const resolvers = {
    bonuses: async(parent, { search, sort}, {user}) => {
        let bonuses = [];
        if(user.role==='admin'){
            bonuses =  await BonusAzyk.find()
                .populate({
                    path: 'organization',
                    match: {name: {'$regex': search, '$options': 'i'}}
                })
                .sort(sort)
            bonuses = bonuses.filter(basket => basket.organization)
        }
        else if(['организация', 'менеджер', 'экспедитор', 'агент'].includes(user.role)){
            bonuses =  await BonusAzyk.find({organization: user.organization})
                .populate({
                    path: 'organization',
                    match: {status: 'active'}
                })
                .sort(sort)
            bonuses = bonuses.filter(basket => basket.organization)
        }
        else if(!user.role||user.role==='client'){
            bonuses =  await BonusAzyk.find({target: {$gt: 0}})
                .populate({
                    path: 'organization',
                    match: {name: {'$regex': search, '$options': 'i'}, status: 'active'}
                })
                .sort(sort)
            bonuses = bonuses.filter(basket => basket.organization)
        }
        return bonuses
    },
    bonus: async(parent, {_id}, {user}) => {
        let bonus;
        if(user.role==='admin'){
            bonus =  await BonusAzyk.findOne({_id: _id})
        }
        else if(['организация', 'менеджер', 'экспедитор', 'агент'].includes(user.role)){
            bonus =  await BonusAzyk.findOne({organization: user.organization})
                .populate({
                    path: 'organization',
                    match: {status: 'active'}
                })
            if(!bonus.organization)
                bonus = null
        }
        else if(!user.role||user.role==='client'){
            bonus =  await BonusAzyk.find({_id: _id})
                .populate({
                    path: 'organization',
                    match: {status: 'active'}
                })
            if(!bonus.organization)
                bonus = null
        }
        return bonus
    },
    sortBonus: async(parent, ctx, {user}) => {
        if(!user.role||['admin', 'client'].includes(user.role))
            return [
                {
                    name: 'Цель',
                    field: 'bonus'
                },
                {
                    name: 'Бонус',
                    field: 'target'
                }
            ];
        else
            return []
    },
};

const resolversMutation = {
    setBonus: async(parent, {_id, target, bonus}, {user}) => {
        if(['admin', 'организация', 'менеджер'].includes(user.role)) {
            let bonusFind = await BonusAzyk.findOne({_id: _id})
            if('admin'===user.role||(['организация', 'менеджер'].includes(user.role)&&bonusFind.organization.toString()===user.organization.toString())) {
                if(target) bonusFind.target = target;
                if(bonus) bonusFind.bonus = bonus;
                bonusFind.save();
            }
        }
        return {data: 'OK'};
    }
};
module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;