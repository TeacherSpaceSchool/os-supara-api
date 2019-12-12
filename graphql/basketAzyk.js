const BasketAzyk = require('../models/basketAzyk');
const ClientAzyk = require('../models/clientAzyk');
const ItemAzyk = require('../models/itemAzyk');
const BASKET_ADDED = 'BASKET_ADDED';
const indexGQL = require('./index');

const type = `
  type Basket {
    _id: ID
    createdAt: Date
    item: Item
    count: Int,
    client: Client
  }
`;

const query = `
    baskets: [Basket]
    countBasket: Int
`;

const mutation = `
    addBasket(item: ID!, count: Int!): Data
    setBasket(_id: ID!, count: Int!): Data
    deleteBasket(_id: [ID]!): Data
`;

const subscription  = `
    addedBasket: Data
`;

const resolvers = {
    baskets: async(parent, ctx, {user}) => {
        let baskets =  await BasketAzyk.find({$or: [{client: user.client}, {agent: user.employment}]})
            .populate({
                path: 'client'
            })
            .populate({
                path: 'agent'
            })
            .populate({
                path: 'item',
                match: {status: 'active'},
                populate : [
                    { path : 'organization'}
                ]
            })
            .sort('-createdAt')
        baskets = baskets.filter(basket => ((basket.client||basket.agent)&&basket.item))
        return baskets
    },
    countBasket: async(parent, ctx, {user}) => {
        return await BasketAzyk.count({$or: [{client: user.client}, {agent: user.employment}]})
    }
};

const resolversMutation = {
    addBasket: async(parent, {item, count}, {user}) => {
        if(['агент', 'client'].includes(user.role)){
            let basket = await BasketAzyk.findOne({item: item, $or: [{client: user.client}, {agent: user.employment}]});
            if(basket===null){
                let _object = new BasketAzyk({
                    item: item,
                    count: count,
                    client: user.client,
                    agent: user.employment
                });
                await BasketAzyk.create(_object)
            } else {
                basket.count = count;
                basket.save();
            }

            let object = await ItemAzyk.findOne({_id: item})
            let index = object.basket.indexOf(user._id)
            if(index===-1){
                object.basket.push(user._id)
                object.save()
            }
            indexGQL.pubsub.publish(BASKET_ADDED, { postAdded: {data: 'OK'} });
        }
        return {data: 'OK'};
    },
    setBasket: async(parent, {_id, count}, { user }) => {
        let object = await BasketAzyk.findOne({_id: _id, $or: [{client: user.client}, {agent: user.employment}]});
        if(object) {
            object.count = count;
            object.save();
        }
        return {data: 'OK'}
    },
    deleteBasket: async(parent, { _id }, { user }) => {
        let basket = await BasketAzyk.findOne({_id: _id, $or: [{client: user.client}, {agent: user.employment}]});
        if(basket){
            let object = await ItemAzyk.findOne({_id: basket.item})
            let index = object.basket.indexOf(user._id)
            object.basket.splice(index, 1)
            object.save()
            await BasketAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

const resolversSubscription = {
    addedBasket: {
        subscribe: () => indexGQL.pubsub.asyncIterator([BASKET_ADDED]),
    },

}

module.exports.subscription = subscription;
module.exports.resolversSubscription = resolversSubscription;
module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;