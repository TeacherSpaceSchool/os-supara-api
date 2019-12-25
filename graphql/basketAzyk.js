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
    deleteBasketAll: Data
`;

const subscription  = `
    addedBasket: Data
`;

const resolvers = {
    baskets: async(parent, ctx, {user}) => {
        let baskets =  await BasketAzyk.find(user.client?{client: user.client}:{agent: user.employment})
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
        baskets = baskets.filter(basket => ((user.client?basket.client:basket.agent)&&basket.item))
        return baskets
    },
    countBasket: async(parent, ctx, {user}) => {
        let count = 0;
        if(['client'].includes(user.role)) {
            count = await BasketAzyk.find(user.client)
                .populate({
                    path: 'item',
                    match: {status: 'active'}
                })
            count = count.filter(basket => (basket.item))
            count = count.length
        }
        return count
    }
};

const resolversMutation = {
    addBasket: async(parent, {item, count}, {user}) => {
        if(['агент', 'client'].includes(user.role)){
            let basket = await BasketAzyk.findOne(
                user.client?
                    {item: item, client: user.client}:
                    {item: item, agent: user.employment}
                );
            if(basket===null){
                let _object = new BasketAzyk({
                    item: item,
                    count: count
                });
                if(user.client)
                    _object.client = user.client
                else
                    _object.agent = user.employment
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
        let object = await BasketAzyk.findOne(
            user.client?
                {_id: _id, client: user.client}:
                {_id: _id, agent: user.employment}
        );
        if(object) {
            object.count = count;
            object.save();
        }
        return {data: 'OK'}
    },
    deleteBasket: async(parent, { _id }, { user }) => {
        for(let i=0; i<_id.length; i++) {
            let basket = await BasketAzyk.findOne(
                user.client ?
                    {
                        $or: [{_id: _id[i]}, {item: _id[i]}],
                        client: user.client
                    } :
                    {$or: [{_id: _id[i]}, {item: _id[i]}], agent: user.employment}
            );
            if (basket) {
                let object = await ItemAzyk.findOne({_id: basket.item})
                let index = object.basket.indexOf(user._id)
                object.basket.splice(index, 1)
                object.save()
                await BasketAzyk.deleteOne({_id: basket._id})
            }
        }
        return {data: 'OK'}
    },
    deleteBasketAll: async(parent, ctx, { user }) => {
        await BasketAzyk.deleteMany({agent: user.employment})
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