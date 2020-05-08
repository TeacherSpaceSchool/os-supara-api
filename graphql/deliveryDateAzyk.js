const DeliveryDate = require('../models/deliveryDateAzyk');

const type = `
  type DeliveryDate {
    _id: ID
    createdAt: Date
    client: Client
    days: [Boolean]
    organization: Organization
  }
`;

const query = `
    deliveryDates: [Basket]
`;

const mutation = `
    setDeliveryDate(_id: ID!, count: Int!, consignment: Int): Data
    deleteBasket(_id: [ID]!): Data
    deleteBasketAll: Data
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
            count = await BasketAzyk.find({client: user.client})
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
    addBasket: async(parent, {item, count, consignment}, {user}) => {
        if(['суперагент','суперорганизация', 'организация', 'менеджер', 'агент', 'client'].includes(user.role)){
            let basket = await BasketAzyk.findOne(
                user.client?
                    {item: item, client: user.client}
                    :
                    {item: item, agent: user.employment}
                );
            if(!basket){
                let _object = new BasketAzyk({
                    item: item,
                    count: count
                });
                if(consignment)
                    _object.consignment = consignment
                if(user.client)
                    _object.client = user.client
                else
                    _object.agent = user.employment
                await BasketAzyk.create(_object)
            } else {
                basket.count = count;
                if(consignment)
                    basket.consignment = consignment
                await basket.save();
            }
            if(user.client) {
                let object = await ItemAzyk.findOne({_id: item})
                let index = object.basket.indexOf(user._id)
                if (index === -1) {
                    object.basket.push(user._id)
                    await object.save()
                }
            }
        }
        return {data: 'OK'};
    },
    setBasket: async(parent, {_id, count, consignment}, { user }) => {
        let object = await BasketAzyk.findOne(
            user.client?
                {_id: _id, client: user.client}:
                {_id: _id, agent: user.employment}
        );
        if(object) {
            object.count = count;
            if(consignment) object.consignment = consignment
            await object.save();
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
                await object.save()
                await BasketAzyk.deleteOne({_id: basket._id})
            }
        }
        return {data: 'OK'}
    },
    deleteBasketAll: async(parent, ctx, { user }) => {
        await BasketAzyk.deleteMany(
            user.client ?
                {client: user.client}
                    :
                { agent: user.employment})
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;