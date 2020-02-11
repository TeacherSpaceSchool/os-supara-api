const OrderAzyk = require('../models/orderAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const RouteAzyk = require('../models/routeAzyk');
const BasketAzyk = require('../models/basketAzyk');
const mongoose = require('mongoose');
const ItemAzyk = require('../models/itemAzyk');
const { addBonusToClient } = require('../module/bonusClientAzyk');
const randomstring = require('randomstring');
const BonusClientAzyk = require('../models/bonusClientAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const BonusAzyk = require('../models/bonusAzyk');
const { pubsub } = require('./index');
const { withFilter } = require('graphql-subscriptions');
const RELOAD_ORDER = 'RELOAD_ORDER';
const DistrictAzyk = require('../models/districtAzyk');
const HistoryOrderAzyk = require('../models/historyOrderAzyk');
const { sendWebPush } = require('../module/webPush');
const { getAdminId } = require('../module/user');

const type = `
  type Order {
    _id: ID
    createdAt: Date
    updatedAt: Date
    item: Item
    client: Client
    count: Int
    allPrice: Int
    status: String
    allTonnage: Float
    allSize: Float
    consignment: Int
    returned: Int
    consignmentPrice: Int
  }
  type Invoice {
    _id: ID
    createdAt: Date
    updatedAt: Date
    orders: [Order]
    client: Client
    allPrice: Int 
    consignmentPrice: Int
    info: String,
    address: [String]
    paymentMethod: String
    number: String
    confirmationForwarder: Boolean
    confirmationClient: Boolean
    paymentConsignation: Boolean
    cancelClient: Date
    cancelForwarder: Date
    taken: Boolean
    dateDelivery: Date
    usedBonus: Int
    agent: Employment
    allTonnage: Float
    allSize: Float
    editor: String
  }
  type HistoryOrder {
    createdAt: Date
    invoice: ID
    orders: [HistoryOrderElement]
    editor: String
  }
  type HistoryOrderElement {
    item: String
    count: Int
    consignment: Int
    returned: Int
  }
  type ReloadOrder {
    who: ID
    client: ID
    agent: ID
    organization: ID
  }
  input OrderInput {
    _id: ID
    count: Int
    allPrice: Float
    allTonnage: Float
    allSize: Float
    name: String
    status: String
    consignment: Int
    returned: Int
    consignmentPrice: Float
  }
`;

const query = `
    invoices(search: String!, sort: String!, filter: String!, date: String!): [Invoice]
    orderHistorys(invoice: ID!): [HistoryOrder]
    invoicesForRouting(organization: ID): [Invoice]
    invoice(_id: ID!): Invoice
    sortInvoice: [Sort]
    filterInvoice: [Filter]
`;

const mutation = `
    addOrders(info: String, usedBonus: Boolean, paymentMethod: String, address: [[String]], organization: ID!, client: ID!): Data
    setOrder(orders: [OrderInput], invoice: ID): Data
    setInvoice(taken: Boolean, invoice: ID!, confirmationClient: Boolean, confirmationForwarder: Boolean, cancelClient: Boolean, cancelForwarder: Boolean, paymentConsignation: Boolean): Data
    deleteOrders(_id: [ID]!): Data
    approveOrders(invoices: [ID]!, route: ID): Data
`;

const subscription  = `
    reloadOrder: ReloadOrder
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
            let invoices =  await InvoiceAzyk.find({
                    del: {$ne: 'deleted'},
                    client: user.client,
                    ...(date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                    ...(filter!=='консигнации'?{}:{ consignmentPrice: { $gt: 0 }})

                }
            )
                .populate({
                    path: 'orders',
                    match: filter!=='консигнации'?{ status: {'$regex': filter, '$options': 'i'}}:{},
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
                        ((invoice.address[2]?invoice.address[2]:'').toLowerCase()).includes(search.toLowerCase())||
                        (invoice.paymentMethod.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.client.name.toLowerCase()).includes(search.toLowerCase())||
                        invoice.agent&&(invoice.agent.name.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase()))

            )
            return invoices
        }
        else if(user.role==='агент'){
            if(date!=='') {
                let now = new Date()
                let differenceDates = (now - dateStart) / (1000 * 60 * 60 * 24)
                if(differenceDates>3) {
                    dateStart = new Date()
                    dateEnd = new Date(dateStart)
                    dateEnd = dateEnd.setDate(dateEnd.getDate() - 3)
                }
            }
            else {
                dateEnd = new Date()
                dateStart = new Date(dateEnd)
                dateStart = dateStart.setDate(dateStart.getDate() - 3)
            }
            let clients = await DistrictAzyk
                .find({agent: user.employment})
                .distinct('client')
            let invoices =  await InvoiceAzyk.find({
                del: {$ne: 'deleted'},
                client: {$in: clients},
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                ...(filter!=='консигнации'?{}:{ consignmentPrice: { $gt: 0 }})
            })
                .populate({
                    path: 'orders',
                    match: filter!=='консигнации'?{ status: {'$regex': filter, '$options': 'i'}}:{},
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
                invoice =>
                    invoice.orders.length>0&&invoice.orders[0].item&&
                    ((invoice.number.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.info.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.address[0].toLowerCase()).includes(search.toLowerCase())||
                        ((invoice.address[2]?invoice.address[2]:'').toLowerCase()).includes(search.toLowerCase())||
                        (invoice.paymentMethod.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.client.name.toLowerCase()).includes(search.toLowerCase())||
                        invoice.agent&&(invoice.agent.name.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase()))

            )
            return invoices
        }
        else if(user.role==='менеджер'){
            if(date!=='') {
                let now = new Date()
                let differenceDates = (now - dateStart) / (1000 * 60 * 60 * 24)
                if(differenceDates>3) {
                    dateStart = new Date()
                    dateEnd = new Date(dateStart)
                    dateEnd = dateEnd.setDate(dateEnd.getDate() - 3)
                }
            }
            else {
                dateEnd = new Date()
                dateStart = new Date(dateEnd)
                dateStart = dateStart.setDate(dateStart.getDate() - 3)
            }
            let clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            let invoices =  await InvoiceAzyk.find({
                del: {$ne: 'deleted'},
                client: {$in: clients},
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                ...(filter!=='консигнации'?{}:{ consignmentPrice: { $gt: 0 }})
            })
                .populate({
                    path: 'orders',
                    match: filter!=='консигнации'?{ status: {'$regex': filter, '$options': 'i'}}:{},
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
                invoice =>
                    invoice.orders.length>0&&invoice.orders[0].item&&
                    ((invoice.number.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.info.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.address[0].toLowerCase()).includes(search.toLowerCase())||
                        ((invoice.address[2]?invoice.address[2]:'').toLowerCase()).includes(search.toLowerCase())||
                        (invoice.paymentMethod.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.client.name.toLowerCase()).includes(search.toLowerCase())||
                        invoice.agent&&(invoice.agent.name.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase()))

            )
            return invoices
        }
        else if(user.role==='admin') {
            let invoices =  await InvoiceAzyk.find({
                del: {$ne: 'deleted'},
                ...(date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                ...(filter!=='консигнации'?{}:{ consignmentPrice: { $gt: 0 }})
            })
                .populate({
                    path: 'orders',
                    match: filter!=='консигнации'?{ status: {'$regex': filter, '$options': 'i'}}:{},
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
                        ((invoice.address[2]?invoice.address[2]:'').toLowerCase()).includes(search.toLowerCase())||
                        (invoice.paymentMethod.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.client.name.toLowerCase()).includes(search.toLowerCase())||
                        invoice.agent&&(invoice.agent.name.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase())
                    )
            )
            return invoices
        }
        else if(['организация'].includes(user.role)) {
            let invoices =  await InvoiceAzyk.find({
                del: {$ne: 'deleted'},
                ...(date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                ...(filter!=='консигнации'?{}:{ consignmentPrice: { $gt: 0 }})
            })
                .populate({
                    path: 'orders',
                    match: filter!=='консигнации'?{ status: {'$regex': filter, '$options': 'i'}}:{},
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
                        ((invoice.address[2]?invoice.address[2]:'').toLowerCase()).includes(search.toLowerCase())||
                        (invoice.paymentMethod.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.client.name.toLowerCase()).includes(search.toLowerCase())||
                        invoice.agent&&(invoice.agent.name.toLowerCase()).includes(search.toLowerCase())||
                        (invoice.orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase())
                    )
            )
            return invoices
        }
    },
    orderHistorys: async(parent, {invoice}, {user}) => {
        if(['admin', 'организация', 'менеджер'].includes(user.role)){
            let historyOrders =  await HistoryOrderAzyk.find({invoice: invoice})
            return historyOrders
        }
    },
    invoicesForRouting: async(parent, { organization }, {user}) => {
        if(['организация', 'менеджер'].includes(user.role)) {
            let invoices =  await InvoiceAzyk.find({del: {$ne: 'deleted'}})
                .populate({
                    path: 'orders',
                    match: {setRoute: false, status: {$nin: ['выполнен', 'отмена']}},
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
                .sort('createdAt')
            invoices = invoices.filter(
                invoice => invoice.orders.length>0&&invoice.orders[0].item
            )
            return invoices
        }
        else if(['admin'].includes(user.role)) {
            let invoices =  await InvoiceAzyk.find({del: {$ne: 'deleted'}})
                .populate({
                    path: 'orders',
                    match: {setRoute: false, status: {$nin: ['выполнен', 'отмена']}},
                    populate : {
                        path : 'item',
                        match: { organization: organization },
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
                .sort('createdAt')
            invoices = invoices.filter(
                invoice => invoice.orders.length>0&&invoice.orders[0].item
            )
            return invoices
        }
        else  return []
    },
    invoice: async(parent, {_id}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            let invoice = await InvoiceAzyk.findOne({_id: _id})
                .populate({
                    path: 'orders',
                    populate: {
                        path: 'item',
                        populate: [
                            {path: 'organization'}
                        ]
                    }
                })
                .populate({
                    path: 'client',
                    populate: [
                        {path: 'user'}
                    ]
                })
            if (user.role === 'admin' || (user.role === 'client' && invoice.client._id.toString() === user.client.toString()) || (['организация', 'менеджер'].includes(user.role) && invoice.item.organization._id.toString() === user.organization.toString()))
                return invoice
            else return null
        } else return null
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
            },
            {
                name: 'Сумма',
                field: 'allPrice'
            },
            {
                name: 'Кубатура',
                field: 'allTonnage'
            },
            {
                name: 'Тоннаж',
                field: 'allSize'
            },
            {
                name: 'Консигнации',
                field: 'consignmentPrice'
            }
        ]
        return sort
    },
    filterInvoice: async(parent, ctx, {user}) => {
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
        if(user.role)
            filter.push({
                name: 'Консигнации',
                value: 'консигнации'
            })
        return filter
    },
};

const resolversMutation = {
    addOrders: async(parent, {info, paymentMethod, address, organization, usedBonus, client}, {user}) => {
        if(user.client)
            client = user.client
        let baskets = await BasketAzyk.find(
            user.client?
                {client: user.client}:
                {agent: user.employment}
        )
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
            }
            else
                usedBonus=0
            for(let i=0; i<address.length;i++){
                let invoices = {};
                for(let ii=0; ii<baskets.length;ii++){
                    let objectOrder = new OrderAzyk({
                        item: baskets[ii].item._id,
                        client: client,
                        count: baskets[ii].count,
                        consignment: baskets[ii].consignment,
                        consignmentPrice: Math.round(baskets[ii].consignment*(baskets[ii].item.stock?baskets[ii].item.stock:baskets[ii].item.price)),
                        allTonnage: Math.round(baskets[ii].count*(baskets[ii].item.weight?baskets[ii].item.weight:0)),
                        allSize: Math.round(baskets[ii].count*(baskets[ii].item.size?baskets[ii].item.size:0)),
                        allPrice: Math.round(baskets[ii].count*(baskets[ii].item.stock?baskets[ii].item.stock:baskets[ii].item.price)),
                        status: 'обработка',
                        agent: user.employment,
                    });
                    objectOrder = await OrderAzyk.create(objectOrder);
                    if(invoices[baskets[ii].item.organization]===undefined)invoices[baskets[ii].item.organization]=[];
                    objectOrder.organization = baskets[ii].item.organization
                    invoices[baskets[ii].item.organization].push(objectOrder);
                }
                let keysInvoices = Object.keys(invoices)
                for(let ii=0; ii<keysInvoices.length;ii++) {
                    let number = randomstring.generate({length: 12, charset: 'numeric'});
                    while (await InvoiceAzyk.findOne({number: number}))
                        number = randomstring.generate({length: 12, charset: 'numeric'});
                    let allPrice = 0
                    let allTonnage = 0
                    let allSize = 0
                    let consignmentPrice = 0
                    let organizaiton = invoices[keysInvoices[ii]][0].organization
                    let orders = invoices[keysInvoices[ii]]
                    for(let iii=0; iii<orders.length;iii++) {
                        allPrice += orders[iii].allPrice
                        consignmentPrice += orders[iii].consignmentPrice
                        allTonnage += orders[iii].allTonnage
                        allSize += orders[iii].allSize
                        orders[iii] = orders[iii]._id
                    }
                    let objectInvoice = new InvoiceAzyk({
                        orders: orders,
                        client: client,
                        allPrice: Math.round(allPrice),
                        consignmentPrice: Math.round(consignmentPrice),
                        allTonnage: Math.round(allTonnage),
                        allSize: Math.round(allSize),
                        info: info,
                        address: address[i],
                        paymentMethod: paymentMethod,
                        number: number,
                        agent: user.employment,
                        organization: organizaiton
                    });
                    if(usedBonus>0) {
                        objectInvoice.allPrice -= usedBonus
                        objectInvoice.usedBonus = usedBonus
                        usedBonus = 0
                    }
                    objectInvoice = await InvoiceAzyk.create(objectInvoice);


                    pubsub.publish(RELOAD_ORDER, { reloadOrder: {
                        who: user.role==='admin'?null:user._id,
                        agent: user.employment,
                        client: client,
                        organization: organizaiton
                    } });
                }
            }
            for(let i = 0; i< baskets.length; i++){
                let object = await ItemAzyk.findOne({_id: baskets[i].item})
                let index = object.basket.indexOf(user._id)
                object.basket.splice(index, 1)
                object.save()
            }
            await BasketAzyk.deleteMany({_id: {$in: baskets.map(element=>element._id)}})
            /*if(getAdminId())
                sendWebPush('Добавлен заказ', '', getAdminId())*/
        }
        return {data: 'OK'};
    },
    deleteOrders: async(parent, {_id}, {user}) => {
        if(user.role==='admin'){
            let objects = await InvoiceAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].del = 'deleted'
                objects[i].save()
                pubsub.publish(RELOAD_ORDER, { reloadOrder: {
                    who: user.role==='admin'?null:user._id,
                    client: objects[i].client,
                    agent: objects[i].agent,
                    organization: objects[i].organization
                } });
            }
        }
        return {data: 'OK'};
    },
    setOrder: async(parent, {orders, invoice}, {user}) => {
        if(orders.length>0&&/*orders[0].status==='обработка'&&*/(['менеджер', 'организация', 'admin', 'client', 'агент'].includes(user.role))){
            let allPrice = 0
            let allTonnage = 0
            let allSize = 0
            let consignmentPrice = 0
            for(let i=0; i<orders.length;i++){
                await OrderAzyk.updateMany(
                    {_id: orders[i]._id},
                    {
                        count: orders[i].count,
                        allPrice: Math.round(orders[i].allPrice),
                        consignmentPrice: Math.round(orders[i].consignmentPrice),
                        returned: orders[i].returned,
                        consignment: orders[i].consignment,
                        allSize: Math.round(orders[i].allSize),
                        allTonnage: Math.round(orders[i].allTonnage)
                    });
                allPrice += orders[i].allPrice
                allTonnage += orders[i].allTonnage
                allSize += orders[i].allSize
                consignmentPrice += orders[i].consignmentPrice
            }
            let object = await InvoiceAzyk.findOne({_id: invoice}).populate({ path: 'client'})

            let editor;
            if(user.role==='admin'){
                editor = 'админ'
            }
            else if(user.role==='client'){
                editor = `клиент ${object.client.name}`
            }
            else{
                let employment = await EmploymentAzyk.findOne({user: user._id})
                editor = `${user.role} ${employment.name}`
            }
            let objectHistoryOrder = new HistoryOrderAzyk({
                invoice: invoice,
                orders: orders.map(order=>{
                    return {
                        item: order.name,
                        count: order.count,
                        consignment: order.consignment,
                        returned: order.returned
                    }
                }),
                editor: editor,
            });
            await HistoryOrderAzyk.create(objectHistoryOrder);

            if(object.usedBonus&&object.usedBonus>0)
                object.allPrice = Math.round(allPrice - object.usedBonus)
            else
                object.allPrice = Math.round(allPrice)
            object.allTonnage = allTonnage
            object.consignmentPrice = Math.round(consignmentPrice)
            object.allSize = allSize
            object.editor = editor
            object.orders = orders.map(order=>order._id)
            await object.save();
            pubsub.publish(RELOAD_ORDER, { reloadOrder: {
                who: user.role==='admin'?null:user._id,
                client: object.client._id,
                agent: object.agent,
                organization: object.organization
            } });

            /*if(user._id.toString()!==(getAdminId()).toString())
                sendWebPush('Заказ изменен', '', getAdminId())

            if(user._id.toString()!==(object.client.user).toString())
                sendWebPush('Заказ изменен', '', object.client.user)*/

        }
        return {data: 'OK'};
    },
    setInvoice: async(parent, {taken, invoice, confirmationClient, confirmationForwarder, cancelClient, cancelForwarder, paymentConsignation}, {user}) => {
        let object = await InvoiceAzyk.findOne({_id: invoice}).populate('client')
        let order = await OrderAzyk.findOne({_id: object.orders[0]._id}).populate('item')
        let admin = user.role==='admin'
        let client = 'client'===user.role&&user.client.toString()===object.client._id.toString()
        let undefinedClient = ['менеджер', 'организация', 'экспедитор', 'агент'].includes(user.role)&&!object.client.user
        let employment = ['менеджер', 'организация', 'агент', 'экспедитор'].includes(user.role)&&order.item.organization.toString()===user.organization.toString();
        if(paymentConsignation!=undefined&&(admin||undefinedClient||employment)){
            object.paymentConsignation = paymentConsignation
        }
        if(taken!=undefined&&(admin||employment)){
            object.taken = taken
            if(taken)
                await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'принят'})
            else {
                await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'обработка', returned: 0})
                object.confirmationForwarder = false
                object.confirmationClient = false
            }
        }
        if(object.taken&&confirmationClient!=undefined&&(admin||undefinedClient||client)){
            object.confirmationClient = confirmationClient
            if(!confirmationClient)
                await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'принят'})
        }
        if(object.taken&&confirmationForwarder!=undefined&&(admin||employment)){
            object.confirmationForwarder = confirmationForwarder
            if(!confirmationForwarder)
                await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'принят'})
        }
        if(object.taken&&object.confirmationForwarder&&object.confirmationClient){
            await addBonusToClient(object.client, order.item.organization, object.allPrice)
            await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'выполнен'})
            object.dateDelivery = new Date()
        }

        if(object.taken&&(object.confirmationForwarder||object.confirmationClient)){
            let route = await RouteAzyk.findOne({invoices: invoice}).populate({
                path: 'invoices',
                populate : {
                    path : 'orders',
                }
            });
            if(route){
                let completedRoute = true;
                for(let i = 0; i<route.invoices.length; i++) {
                    if(!route.invoices[i].cancelClient&&!route.invoices[i].cancelForwarder)
                        completedRoute = route.invoices[i].confirmationForwarder;
                }
                if(completedRoute)
                    route.status = 'выполнен';
                else
                    route.status = 'выполняется';
                route.save();
            }
        }

        if(cancelClient!=undefined&&(cancelClient||object.cancelClient!=undefined)&&!object.cancelForwarder&&(admin||client)){
            if(cancelClient){
                object.cancelClient = new Date()
                await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'отмена'})
                if(object.usedBonus&&object.usedBonus>0) {
                    let bonus = await BonusAzyk.findOne({organization: order.item.organization});
                    let bonusClient = await BonusClientAzyk.findOne({client: user.client, bonus: bonus._id})
                    bonusClient.addedBonus += object.usedBonus
                    await bonusClient.save();
                }
            }
            else if(!cancelClient) {
                let difference = (new Date()).getTime() - (object.cancelClient).getTime();
                let differenceMinutes = Math.round(difference / 60000);
                if (differenceMinutes < 10||user.role==='admin') {
                    object.cancelClient = undefined
                    await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'обработка'})
                    object.dateDelivery = undefined
                    object.taken = undefined
                    object.confirmationClient = undefined
                    object.confirmationForwarder = undefined
                    if(object.usedBonus&&object.usedBonus>0) {
                        let bonus = await BonusAzyk.findOne({organization: order.item.organization});
                        let bonusClient = await BonusClientAzyk.findOne({client: user.client, bonus: bonus._id})
                        bonusClient.addedBonus -= object.usedBonus
                        await bonusClient.save();
                    }
                }
            }
        }

        if(cancelForwarder!=undefined&&(cancelForwarder||object.cancelForwarder!=undefined)&&!object.cancelClient&&(admin||employment)){
            if(cancelForwarder){
                object.cancelForwarder = new Date()
                await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'отмена'})
                if(object.usedBonus&&object.usedBonus>0) {
                    let bonus = await BonusAzyk.findOne({organization: order.item.organization});
                    let bonusClient = await BonusClientAzyk.findOne({client: user.client, bonus: bonus._id})
                    bonusClient.addedBonus += object.usedBonus
                    await bonusClient.save();
                }
            }
            else if(!cancelForwarder) {
                let difference = (new Date()).getTime() - (object.cancelForwarder).getTime();
                let differenceMinutes = Math.round(difference / 60000);
                if (differenceMinutes < 10||user.role==='admin') {
                    object.cancelForwarder = undefined
                    object.cancelClient = undefined
                    await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'обработка'})
                    object.dateDelivery = undefined
                    object.taken = undefined
                    object.confirmationClient = undefined
                    object.confirmationForwarder = undefined
                    if(object.usedBonus&&object.usedBonus>0) {
                        let bonus = await BonusAzyk.findOne({organization: order.item.organization});
                        let bonusClient = await BonusClientAzyk.findOne({client: user.client, bonus: bonus._id})
                        bonusClient.addedBonus += object.usedBonus
                        await bonusClient.save();
                    }
                }
            }
        }

        await object.save();
        return {data: 'OK'};
    },
    /*approveOrders: async(parent, {invoices, route}, {user}) => {
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
    }*/
};

const resolversSubscription = {
    reloadOrder: {
        subscribe: withFilter(
            () => pubsub.asyncIterator(RELOAD_ORDER),
            (payload, variables, {user} ) => {
                return (
                    user.role==='admin'||
                    (user.client&&payload.reloadOrder.client.toString()===user.client.toString())||
                    (user.employment&&payload.reloadOrder.agent&&payload.reloadOrder.agent.toString()===user.employment.toString())||
                    (user.organization&&payload.reloadOrder.organization&&['организация', 'менеджер'].includes(user.role)&&payload.reloadOrder.organization.toString()===user.organization.toString())
                )
            },
        )
    },

}

module.exports.RELOAD_ORDER = RELOAD_ORDER;
module.exports.resolversSubscription = resolversSubscription;
module.exports.subscription = subscription;
module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;