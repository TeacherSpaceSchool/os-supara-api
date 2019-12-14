const OrderAzyk = require('../models/orderAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const BasketAzyk = require('../models/basketAzyk');
const RouteAzyk = require('../models/routeAzyk');
const ItemAzyk = require('../models/itemAzyk');
const { addBonusToClient } = require('../module/bonusClientAzyk');
const { pubsub } = require('./index');
const randomstring = require('randomstring');
const BonusClientAzyk = require('../models/bonusClientAzyk');
const BonusAzyk = require('../models/bonusAzyk');

const type = `
  type Order {
    _id: ID
    createdAt: Date
    item: Item,
    client: Client,
    count: Int,
    allPrice: Int,
    status: String,
  }
  type Invoice {
    _id: ID
    createdAt: Date
    orders: [Order],
    client: Client,
    allPrice: Int ,
    info: String,
    address: [String],
    paymentMethod: String,
    number: String,
    confirmationForwarder: Boolean,
    confirmationClient: Boolean
    dateDelivery: Date
    usedBonus: Int
    agent: Employment
  }
  input OrderInput {
    _id: ID
    count: Int,
    allPrice: Int,
    status: String
  }
`;

const query = `
    invoices(search: String!, sort: String!, filter: String!, date: String!): [Invoice]
    invoice(_id: ID!): Invoice
    sortInvoice: [Sort]
    filterInvoice: [Filter]
`;

const mutation = `
    addOrders(info: String, usedBonus: Boolean, paymentMethod: String, address: [[String]], organization: ID!, client: ID!): Data
    setOrder(orders: [OrderInput], invoice: ID): Data
    cancelOrders(_id: [ID]!, invoice: ID): Data
    approveOrders(invoices: [ID]!, route: ID): Data
`;

const subscription  = `
    addedOrder: Data
`;

const resolvers = {
    invoices: async(parent, {search, sort, filter, date}, {user}) => {
        let dateStart;
        let dateEnd;
        if(date!==''){
            dateStart = new Date(date)
            dateEnd = new Date(dateStart)
            dateEnd = dateEnd.setDate(dateEnd.getDate() + 1)
        }
        if(user.role==='client'){
            let invoices =  await InvoiceAzyk.find(date===''?{client: user.client}:{client: user.client, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]})
                .populate({
                    path: 'orders',
                    match: { status: {'$regex': filter, '$options': 'i'},  },
                    populate : {
                        path : 'item',
                        populate : [
                            { path : 'organization'}
                        ]

                    }
                })
                .populate({
                    path: 'client',
                    populate : [
                        { path : 'user'}
                    ]
                })
                .sort(sort)
            invoices = invoices.filter(
                invoice =>
                    invoice.orders.length>0&&invoice.orders[0].item&&
                    ((invoice.number.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.info.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.address[0].toLowerCase()).includes(search.toLowerCase())||
                        (invoice.paymentMethod.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.client.name.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase()))

            )
            return invoices
        }
        if(user.role==='агент'){
            let invoices =  await InvoiceAzyk.find(date===''?{agent: user.employment}:{agent: user.employment, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]})
                .populate({
                    path: 'orders',
                    match: { status: {'$regex': filter, '$options': 'i'},  },
                    populate : {
                        path : 'item',
                        populate : [
                            { path : 'organization'}
                        ]

                    }
                })
                .populate({
                    path: 'client',
                    populate : [
                        { path : 'user'}
                    ]
                })
                .populate({
                    path: 'agent'
                })
                .sort(sort)
            invoices = invoices.filter(
                invoice =>
                    invoice.orders.length>0&&invoice.orders[0].item&&
                    ((invoice.number.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.info.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.address[0].toLowerCase()).includes(search.toLowerCase())||
                        (invoice.paymentMethod.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.client.name.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase()))

            )
            console.log(invoices)
            return invoices
        }
        else if(user.role==='admin') {
            let invoices =  await InvoiceAzyk.find(date===''?{}:{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]})
                .populate({
                    path: 'orders',
                    match: { status: {'$regex': filter, '$options': 'i'},  },
                    populate : {
                        path : 'item',
                        populate : [
                            { path : 'organization'}
                        ]

                    }
                })
                .populate({
                    path: 'client',
                    populate : [
                        { path : 'user'}
                    ]
                })
                .populate({
                    path: 'agent'
                })
                .sort(sort)
            invoices = invoices.filter(
                    invoice =>
                        invoice.orders.length>0&&invoice.orders[0].item&&(
                            (invoice.number.toLowerCase()).includes(search.toLowerCase())||
                            (invoice.info.toLowerCase()).includes(search.toLowerCase())||
                            (invoice.address[0].toLowerCase()).includes(search.toLowerCase())||
                            (invoice.paymentMethod.toLowerCase()).includes(search.toLowerCase())||
                            (invoice.client.name.toLowerCase()).includes(search.toLowerCase())||
                            (invoice.orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase())
                        )
                )
            return invoices
        } else if(['организация', 'менеджер'].includes(user.role)) {
            let invoices =  await InvoiceAzyk.find(date===''?{}:{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]})
                .populate({
                    path: 'orders',
                    match: { status: {'$regex': filter, '$options': 'i'},  },
                    populate : {
                        path : 'item',
                        match: { organization: user.organization },
                        populate : [
                            { path : 'organization'}
                        ]
                    }
                })
                .populate({
                    path: 'client',
                    populate : [
                        { path : 'user'}
                    ]
                })
                .populate({
                    path: 'agent'
                })
                .sort(sort)
            invoices = invoices.filter(
                    invoice => invoice.orders.length>0&&invoice.orders[0].item&&
                        (
                            (invoice.number.toLowerCase()).includes(search.toLowerCase())||
                            (invoice.info.toLowerCase()).includes(search.toLowerCase())||
                            (invoice.address[0].toLowerCase()).includes(search.toLowerCase())||
                            (invoice.paymentMethod.toLowerCase()).includes(search.toLowerCase())||
                            (invoice.client.name.toLowerCase()).includes(search.toLowerCase())||
                            (invoice.orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase())
                        )
                )
            return invoices
        }
    },
    invoice: async(parent, {_id}, {user}) => {
        let invoice =  await InvoiceAzyk.findOne({_id: _id})
                .populate({
                    path: 'orders',
                    populate : {
                        path : 'item',
                        populate : [
                            { path : 'organization'}
                        ]
                    }
                })
                .populate({
                    path: 'client',
                    populate : [
                        { path : 'user'}
                    ]
                })
        if(user.role==='admin'||(user.role==='client'&&invoice.client._id.toString()===user.client.toString())||(['организация', 'менеджер'].includes(user.role)&&invoice.item.organization._id.toString()===user.organization.toString()))
            return invoice
        else return null
    },
    sortInvoice: async() => {
        let sort = [
            {
                name: 'Дата',
                field: 'createdAt'
            },
            {
                name: 'Статус',
                field: 'status'
            }
        ]
        return sort
    },
    filterInvoice: async() => {
        let filter = [
            {
                name: 'Все',
                value: ''
            },
            {
                name: 'Обработка',
                value: 'обработка'
            },
            {
                name: 'Отмена',
                value: 'отмена'
            },
            {
                name: 'Принят',
                value: 'принят'
            },
            {
                name: 'Выполнен',
                value: 'выполнен'
            }
        ]
        return filter
    },
};

const resolversMutation = {
    addOrders: async(parent, {info, paymentMethod, address, organization, usedBonus, client}, {user}) => {
        let baskets = await BasketAzyk.find({ $or: [{client: client}, {agent: user.employment}]})
            .populate({
                path: 'item',
                match: {status: 'active', organization: organization}
            });
        baskets = baskets.filter(basket => (basket.item))
        if(baskets.length>0){
            if(usedBonus){
                let bonus = await BonusAzyk.findOne({organization: organization});
                let bonusClient = await BonusClientAzyk.findOne({client: client, bonus: bonus._id})
                usedBonus = bonusClient.addedBonus;
                bonusClient.addedBonus = 0
                bonusClient.save();
            } else
                usedBonus=0
            for(let i=0; i<address.length;i++){
                let invoices = {};
                for(let ii=0; ii<baskets.length;ii++){
                    let objectOrder = new OrderAzyk({
                        item: baskets[ii].item._id,
                        client: client,
                        count: baskets[ii].count,
                        allPrice: baskets[ii].count*baskets[ii].item.price,
                        status: 'обработка',
                        agent: user.employment
                    });
                    objectOrder = await OrderAzyk.create(objectOrder);
                    if(invoices[baskets[ii].item.organization]===undefined)invoices[baskets[ii].item.organization]=[];
                    invoices[baskets[ii].item.organization].push(objectOrder);
                }
                let keysInvoices = Object.keys(invoices)
                for(let ii=0; ii<keysInvoices.length;ii++) {
                    let number = randomstring.generate({length: 12, charset: 'numeric'});
                    while (await OrderAzyk.findOne({number: number}))
                        number = randomstring.generate({length: 12, charset: 'numeric'});
                    let allPrice = 0
                    let orders = invoices[keysInvoices[ii]]
                    for(let iii=0; iii<orders.length;iii++) {
                        allPrice += orders[iii].allPrice
                        orders[iii] = orders[iii]._id
                    }
                    let objectInvoice = new InvoiceAzyk({
                        orders: orders,
                        client: client,
                        allPrice: allPrice,
                        info: info,
                        address: address[i],
                        paymentMethod: paymentMethod,
                        number: number,
                        agent: user.employment
                    });
                    if(usedBonus>0) {
                        objectInvoice.allPrice -= usedBonus
                        objectInvoice.usedBonus = usedBonus
                        usedBonus = 0
                    }
                    objectInvoice = await InvoiceAzyk.create(objectInvoice);
                }
            }
            for(let i = 0; i< baskets.length; i++){
                let object = await ItemAzyk.findOne({_id: baskets[i].item})
                let index = object.basket.indexOf(user._id)
                object.basket.splice(index, 1)
                object.save()
            }
            await BasketAzyk.deleteMany({_id: {$in: baskets.map(element=>element._id)}})
        }
        //pubsub.publish('ORDER_ADDED', { postAdded: {data: 'OK'} });
        return {data: 'OK'};
    },
    cancelOrders: async(parent, {_id, invoice}, {user}) => {
        let orders = await OrderAzyk.find({_id: {$in: _id}}).populate('item');
        for(let i = 0; i<orders.length; i++){
            if(user.role==='client'&&orders[i].status==='обработка'
                ||['менеджер', 'организация', 'агент'].includes(user.role)&&['обработка', 'принят'].includes(orders[i].status)
                ||user.role==='admin'){
                orders[i].status = 'отмена'
                orders[i].save()
            }
        }
        let object = await InvoiceAzyk.findOne({_id: invoice})
        if(object.usedBonus&&object.usedBonus>0) {
            let bonus = await BonusAzyk.findOne({organization: orders[0].item.organization});
            let bonusClient = await BonusClientAzyk.findOne({client: user.client, bonus: bonus._id})
            bonusClient.addedBonus += object.usedBonus
            await bonusClient.save();
        }
        return {data: 'OK'};
    },
    setOrder: async(parent, {orders, invoice}, {user}) => {
        if(orders[0].status==='обработка'&&(['менеджер', 'организация', 'admin', 'client', 'агент'].includes(user.role))){
            let allPrice = 0
            for(let i=0; i<orders.length;i++){
                await OrderAzyk.update({_id: orders[i]._id}, {count: orders[i].count, allPrice: orders[i].allPrice});
                allPrice += orders[i].allPrice
            }
            let object = await InvoiceAzyk.findOne({_id: invoice})
            if(object.usedBonus&&object.usedBonus>0)
                object.allPrice = allPrice - object.usedBonus
            else
                object.allPrice = allPrice
            await object.save();
        }
        return {data: 'OK'};
    },
    approveOrders: async(parent, {invoices, route}, {user}) => {
        invoices = await InvoiceAzyk.find({_id: {$in: invoices}}).populate({
            path: 'orders',
            populate : {
                path : 'item',
            }
        });
        for(let i = 0; i<invoices.length; i++){
            if(user.role==='client'){
                invoices[i].confirmationClient = true
                if(invoices[i].confirmationForwarder) {
                    await addBonusToClient(invoices[i].client, invoices[i].orders[0].item.organization, invoices[i].allPrice)
                    invoices[i].orders = invoices[i].orders.map(element=>element._id)
                    await OrderAzyk.updateMany({_id: {$in: invoices[i].orders}}, {status: 'выполнен'})
                    await InvoiceAzyk.update({_id: invoices[i]._id}, {dateDelivery: new Date()});
                }
            }
            else if(['менеджер', 'организация'].includes(user.role)){
                if(user.organization.toString()===invoices[i].orders[0].item.organization.toString()){
                    invoices[i].confirmationForwarder = true
                    if(invoices[i].confirmationClient) {
                        await addBonusToClient(invoices[i].client, invoices[i].orders[0].item.organization, invoices[i].allPrice)
                        invoices[i].orders = invoices[i].orders.map(element=>element._id)
                        await OrderAzyk.updateMany({_id: {$in: invoices[i].orders}}, {status: 'выполнен'})
                        await InvoiceAzyk.update({_id: invoices[i]._id}, {dateDelivery: new Date()});
                    }
                }
            }
            else if('admin'===user.role){
                await addBonusToClient(invoices[i].client, invoices[i].orders[0].item.organization, invoices[i].allPrice)
                invoices[i].confirmationForwarder = true
                invoices[i].confirmationClient = true
                invoices[i].orders = invoices[i].orders.map(element=>element._id)
                await OrderAzyk.updateMany({_id: {$in: invoices[i].orders}}, {status: 'выполнен'})
                await InvoiceAzyk.update({_id: invoices[i]._id}, {dateDelivery: new Date()});
            }
            invoices[i].save();
        }
        route = await RouteAzyk.findById(route).populate({
            path: 'invoices',
            populate : {
                path : 'orders',
            }
        });
        if(route){
            let completedRoute = true;
            for(let i = 0; i<route.invoices.length; i++) {
                completedRoute = route.invoices[i].orders[0].status==='выполнен';
            }
            if(completedRoute)
                route.status = 'выполнен';
            else
                route.status = 'выполняется';
            route.save();
        }
        return {data: 'OK'};
    }
};

const resolversSubscription = {
    addedOrder: {
        subscribe: () => pubsub.asyncIterator(['ORDER_ADDED']),
    },

}

module.exports.subscription = subscription;
module.exports.resolversSubscription = resolversSubscription;
module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;