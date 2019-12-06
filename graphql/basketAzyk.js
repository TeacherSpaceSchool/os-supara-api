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
        let baskets =  await BasketAzyk.find()
            .populate({
                path: 'client',
                match: {user: user._id}
            })
            .populate({
                path: 'item',
                match: {status: 'active'}
            })
            .sort('-createdAt')
        baskets = baskets.filter(basket => (basket.client))
        baskets = baskets.filter(basket => (basket.item))
        return baskets
    },
    countBasket: async(parent, ctx, {user}) => {
        return await BasketAzyk.count({client: user.client})
    }
};

const resolversMutation = {
    addBasket: async(parent, {item, count}, {user}) => {
        let client = await ClientAzyk.findOne({user: user._id})
        let basket = await BasketAzyk.findOne({item: item, client: client._id});
        if(basket===null){
            let _object = new BasketAzyk({
                item: item,
                count: count,
                client: client._id,
            });
            await BasketAzyk.create(_object)
        } else {
            basket.count = count;
            basket.save();
        }

        let object = await ItemAzyk.findOne({_id: item})
        /*if(object.basket===undefined){
            object.basket = []
        }*/
        let index = object.basket.indexOf(user._id)
        if(index===-1){
            object.basket.push(user._id)
            object.save()
        }
        indexGQL.pubsub.publish(BASKET_ADDED, { postAdded: {data: 'OK'} });
        return {data: 'OK'};
    },
    setBasket: async(parent, {_id, count}) => {
        let object = await BasketAzyk.findById(_id);
        object.count = count;
        object.save();
        return {data: 'OK'}
    },
    deleteBasket: async(parent, { _id }, { user }) => {
        let basket = await BasketAzyk.findOne({_id: _id});

        let object = await ItemAzyk.findOne({_id: basket.item})
        let index = object.basket.indexOf(user._id)
        object.basket.splice(index, 1)
        object.save()

        await BasketAzyk.deleteMany({_id: {$in: _id}})
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