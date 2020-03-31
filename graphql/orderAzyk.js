const OrderAzyk = require('../models/orderAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const DistributerAzyk = require('../models/distributerAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const RouteAzyk = require('../models/routeAzyk');
const BasketAzyk = require('../models/basketAzyk');
const ClientAzyk = require('../models/clientAzyk');
const mongoose = require('mongoose');
const ItemAzyk = require('../models/itemAzyk');
const { addBonusToClient } = require('../module/bonusClientAzyk');
const randomstring = require('randomstring');
const BonusClientAzyk = require('../models/bonusClientAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const { setOutXMLShoroAzyk, cancelOutXMLShoroAzyk } = require('../module/outXMLShoroAzyk');
const BonusAzyk = require('../models/bonusAzyk');
const { pubsub } = require('./index');
const { withFilter } = require('graphql-subscriptions');
const RELOAD_ORDER = 'RELOAD_ORDER';
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
    sync: Int
    cancelClient: Date
    cancelForwarder: Date
    taken: Boolean
    dateDelivery: Date
    usedBonus: Int
    agent: Employment
    allTonnage: Float
    allSize: Float
    editor: String
    distributer: Organization
    del: String
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
    manager: ID
    organization: ID
    invoice: Invoice
    type: String
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
    invoices(search: String!, sort: String!, filter: String!, date: String!, skip: Int): [Invoice]
   invoicesSimpleStatistic(search: String!, filter: String!, date: String): [String]
    invoicesTrash(search: String!, skip: Int): [Invoice]
   invoicesTrashSimpleStatistic(search: String!): [String]
    orderHistorys(invoice: ID!): [HistoryOrder]
    invoicesForRouting(organization: ID): [Invoice]
    invoice(_id: ID!): Invoice
    sortInvoice: [Sort]
    filterInvoice: [Filter]
`;

const mutation = `
    addOrders(info: String, usedBonus: Boolean, paymentMethod: String, address: [[String]], organization: ID!, client: ID!): Data
    setOrder(orders: [OrderInput], invoice: ID): Invoice
    setInvoice(taken: Boolean, invoice: ID!, confirmationClient: Boolean, confirmationForwarder: Boolean, cancelClient: Boolean, cancelForwarder: Boolean, paymentConsignation: Boolean): Data
    deleteOrders(_id: [ID]!): Data
    restoreOrders(_id: [ID]!): Data
    approveOrders(invoices: [ID]!, route: ID): Data
`;

const subscription  = `
    reloadOrder: ReloadOrder
`;

const resolvers = {
    invoicesTrashSimpleStatistic: async(parent, {search}, {user}) => {
        let _organizations;
        let _clients;
        let _agents;
        if(search.length>0){
            _organizations = await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _agents = await EmploymentAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
        }
        let invoices = [];
        if(user.role==='admin') {
            invoices =  await InvoiceAzyk.find(
                {
                    del: 'deleted',
                    ...(search.length>0?{
                            $or: [
                                {number: {'$regex': search, '$options': 'i'}},
                                {info: {'$regex': search, '$options': 'i'}},
                                {address: {'$regex': search, '$options': 'i'}},
                                {paymentMethod: {'$regex': search, '$options': 'i'}},
                                {client: {$in: _clients}},
                                {agent: {$in: _agents}},
                                {organization: {$in: _organizations}},
                                {distributer: {$in: _organizations}},
                            ]
                        }
                        :{})
                }
            )
                .populate({
                    path: 'orders'
                })
                .lean()
        }
        return [invoices.length.toString()]
    },
    invoicesSimpleStatistic: async(parent, {search, filter, date,}, {user}) => {
        let dateStart;
        let dateEnd;
        if(date!==''){
            dateStart = new Date(date)
            dateStart.setHours(3, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
        }
        let _organizations;
        let _clients;
        let _agents;
        if(search.length>0){
            _organizations = await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _agents = await EmploymentAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
        }
        let invoices = [];
        if(user.role==='client'){
            invoices =  await InvoiceAzyk.find(
                {
                    del: {$ne: 'deleted'},
                    taken: true,
                    ...(date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                    ...(filter !== 'консигнации' ? {} : {consignmentPrice: {$gt: 0}}),
                    client: user.client,
                    ...(search.length>0?{
                            $or: [
                                {number: {'$regex': search, '$options': 'i'}},
                                {info: {'$regex': search, '$options': 'i'}},
                                {address: {'$regex': search, '$options': 'i'}},
                                {paymentMethod: {'$regex': search, '$options': 'i'}},
                                {agent: {$in: _agents}},
                                {organization: {$in: _organizations}},
                                {distributer: {$in: _organizations}},
                            ]
                        }
                        :{})
                }
            )
                .populate({
                    path: 'orders'
                })
                .lean()
        }
        else if(user.role==='admin') {
            invoices =  await InvoiceAzyk.find(
                {
                    del: {$ne: 'deleted'},
                    taken: true,
                    ...(date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                    ...(filter !== 'консигнации' ? {} : {consignmentPrice: {$gt: 0}}),
                    ...(search.length>0?{
                            $or: [
                                {number: {'$regex': search, '$options': 'i'}},
                                {info: {'$regex': search, '$options': 'i'}},
                                {address: {'$regex': search, '$options': 'i'}},
                                {paymentMethod: {'$regex': search, '$options': 'i'}},
                                {client: {$in: _clients}},
                                {agent: {$in: _agents}},
                                {organization: {$in: _organizations}},
                                {distributer: {$in: _organizations}},
                            ]
                        }
                        :{})
                }
            )
                .populate({
                    path: 'orders'
                })
                .lean()
        }
        else if(['организация'].includes(user.role)) {
            invoices =  await InvoiceAzyk.find(
                {
                    del: {$ne: 'deleted'},
                    taken: true,
                    $and: [
                        ...(date === '' ? []:[{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]),
                        {
                            $or: [
                                {organization: user.organization},
                                {distributer: user.organization},
                            ],
                        },
                        {
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {paymentMethod: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
                                        {agent: {$in: _agents}}
                                    ]
                                }
                                :{
                                })
                        }
                    ],
                    ...(filter !== 'консигнации' ? {} : {consignmentPrice: {$gt: 0}}),
                })
                .populate({
                    path: 'orders'
                })
                .lean()
        }
        else if(user.role==='менеджер'){
            let clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            invoices =  await InvoiceAzyk.find(
                {
                    del: {$ne: 'deleted'},
                    taken: true,
                    ...(filter!=='консигнации'?{}:{ consignmentPrice: { $gt: 0 }}),
                    client: {$in: clients},
                    $and: [
                        ...(date === '' ? []:[{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]),
                        {
                            $or: [
                                {organization: user.organization},
                                {distributer: user.organization},
                            ],
                        },
                        {
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {paymentMethod: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
                                        {agent: {$in: _agents}}
                                    ]
                                }
                                :{})
                        }
                    ],

                }
            )
                .populate({
                    path: 'orders'
                })
                .lean()
        }
        else if(user.role==='агент'){
            if(date!=='') {
                let now = new Date()
                now.setDate(now.getDate() + 1)
                now.setHours(3, 0, 0, 0)
                let differenceDates = (now - dateStart) / (1000 * 60 * 60 * 24)
                if(differenceDates>3) {
                    dateStart = new Date()
                    dateEnd = new Date(dateStart)
                    dateEnd = new Date(dateEnd.setDate(dateEnd.getDate() - 3))
                }
            }
            else {
                dateEnd = new Date()
                dateEnd.setDate(dateEnd.getDate() + 1)
                dateEnd.setHours(3, 0, 0, 0)
                dateStart = new Date(dateEnd)
                dateStart.setDate(dateStart.getDate() - 3)
            }
            let clients = await DistrictAzyk
                .find({agent: user.employment})
                .distinct('client')
            invoices =  await InvoiceAzyk.find(
                {
                    del: {$ne: 'deleted'},
                    taken: true,
                    ...(filter !== 'консигнации' ? {} : {consignmentPrice: {$gt: 0}}),
                    client: {$in: clients},
                    $and: [
                        {createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}},
                        {
                            $or: [
                                {organization: user.organization},
                                {distributer: user.organization},
                            ],
                        },
                        {
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {paymentMethod: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
                                    ]
                                }
                                :{
                                })
                        }
                    ],
                }
            )
                .populate({
                    path: 'orders'
                })
                .lean()
        }
        let tonnage = 0;
        let size = 0;
        let price = 0;
        let consignment = 0;
        let consignmentPayment = 0;
        let lengthList = 0;
        for(let i=0; i<invoices.length; i++){
            if(!invoices[i].cancelClient&&!invoices[i].cancelForwarder) {
                if (invoices[i].allPrice) {
                    for(let i1=0; i1<invoices[i].orders.length;i1++){
                        price += (invoices[i].orders[i1].allPrice - invoices[i].orders[i1].returned * (invoices[i].orders[i1].allPrice / invoices[i].orders[i1].count))
                    }
                }
                if (invoices[i].allSize)
                    size += invoices[i].allSize
                lengthList += 1
                if (invoices[i].allTonnage)
                    tonnage += invoices[i].allTonnage
                if (invoices[i].consignmentPrice)
                    consignment += invoices[i].consignmentPrice
                if (invoices[i].paymentConsignation)
                    consignmentPayment += invoices[i].consignmentPrice
            }
        }
        return [lengthList.toString(), price.toString(), consignment.toString(), consignmentPayment.toString(), tonnage.toString(), size.toString()]
    },
    invoices: async(parent, {search, sort, filter, date, skip}, {user}) =>  {
        let dateStart;
        let dateEnd;
        if(date!==''){
            dateStart = new Date(date)
            dateStart.setHours(3, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
        }
        let _sort = {}
        _sort[sort[0]==='-'?sort.substring(1):sort]=sort[0]==='-'?-1:1
        let _organizations;
        let _clients;
        let _agents;
        if(search.length>0){
            _organizations = await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _agents = await EmploymentAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
        }
        if(user.role==='admin') {
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match:{
                            del: {$ne: 'deleted'},
                            ...(date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                            ...(filter!=='консигнации'?{}:{ consignmentPrice: { $gt: 0 }}),
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {paymentMethod: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
                                        {agent: {$in: _agents}},
                                        {organization: {$in: _organizations}},
                                        {distributer: {$in: _organizations}},
                                    ]
                                }
                                :{})
                        }
                    },
                    { $sort : _sort },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false,
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { distributer: '$distributer' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$distributer', '$_id']}} },
                            ],
                            as: 'distributer'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$distributer'
                        }
                    },
                    { $lookup:
                        {
                            from: OrderAzyk.collection.collectionName,
                            let: { order: '$orders' },
                            pipeline: [
                                { $match: {$expr:{$in:['$_id', '$$order']}} },
                                { $lookup:
                                    {
                                        from: ItemAzyk.collection.collectionName,
                                        let: { item: '$item' },
                                        pipeline: [
                                            { $match: {$expr:{$eq:['$$item', '$_id']}} },
                                            { $lookup:
                                                {
                                                    from: OrganizationAzyk.collection.collectionName,
                                                    let: { organization: '$organization' },
                                                    pipeline: [
                                                        { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                                                    ],
                                                    as: 'organization'
                                                }
                                            },
                                            {
                                                $unwind:{
                                                    preserveNullAndEmptyArrays : false,
                                                    path : '$organization'
                                                }
                                            },
                                        ],
                                        as: 'item'
                                    }
                                },
                                {
                                    $unwind:{
                                        preserveNullAndEmptyArrays : false,
                                        path : '$item'
                                    }
                                },
                            ],
                            as: 'orders'
                        }
                    },
                ])
            console.log(invoices[invoices.length])
            console.log(dateStart)
            console.log(dateEnd)
            return invoices
        }
        else if(user.role==='client'){
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match: {
                            del: {$ne: 'deleted'},
                            ...(date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                            ...(filter !== 'консигнации' ? {} : {consignmentPrice: {$gt: 0}}),
                            client: user.client,
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {paymentMethod: {'$regex': search, '$options': 'i'}},
                                        {agent: {$in: _agents}},
                                        {organization: {$in: _organizations}},
                                        {distributer: {$in: _organizations}},
                                    ]
                                }
                                :{})
                        }
                    },
                    { $sort : _sort },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true, // this remove the object which is null
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: OrderAzyk.collection.collectionName,
                            let: { order: '$orders' },
                            pipeline: [
                                { $match: {$expr:{$in:['$_id', '$$order']}} },
                                { $lookup:
                                    {
                                        from: ItemAzyk.collection.collectionName,
                                        let: { item: '$item' },
                                        pipeline: [
                                            { $match: {$expr:{$eq:['$$item', '$_id']}} },
                                            { $lookup:
                                                {
                                                    from: OrganizationAzyk.collection.collectionName,
                                                    let: { organization: '$organization' },
                                                    pipeline: [
                                                        { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                                                    ],
                                                    as: 'organization'
                                                }
                                            },
                                            {
                                                $unwind:{
                                                    preserveNullAndEmptyArrays : false, // this remove the object which is null
                                                    path : '$organization'
                                                }
                                            },
                                        ],
                                        as: 'item'
                                    }
                                },
                                {
                                    $unwind:{
                                        preserveNullAndEmptyArrays : false, // this remove the object which is null
                                        path : '$item'
                                    }
                                },
                            ],
                            as: 'orders'
                        }
                    },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { distributer: '$distributer' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$distributer', '$_id']}} },
                            ],
                            as: 'distributer'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$distributer'
                        }
                    },
                ])
            return invoices
        }
        else if(user.role==='суперагент'){
            if(date!=='') {
                let now = new Date()
                now.setHours(3, 0, 0, 0)
                now.setDate(now.getDate() + 1)
                let differenceDates = (now - dateStart) / (1000 * 60 * 60 * 24)
                if(differenceDates>3) {
                    dateStart = new Date()
                    dateEnd = new Date(dateStart)
                    dateEnd = new Date(dateEnd.setDate(dateEnd.getDate() - 3))
                }
            }
            else {
                dateEnd = new Date()
                dateEnd.setHours(3, 0, 0, 0)
                dateEnd.setDate(dateEnd.getDate() + 1)
                dateStart = new Date(dateEnd)
                dateStart = new Date(dateStart.setDate(dateStart.getDate() - 3))
            }
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match: {
                            del: {$ne: 'deleted'},
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                            ...(filter !== 'консигнации' ? {} : {consignmentPrice: {$gt: 0}}),
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {paymentMethod: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
                                        {agent: {$in: _agents}},
                                        {organization: {$in: _organizations}},
                                        {distributer: {$in: _organizations}},
                                    ]
                                }
                                :{})
                        }
                    },
                    { $sort : _sort },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { distributer: '$distributer' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$distributer', '$_id']}} },
                            ],
                            as: 'distributer'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$distributer'
                        }
                    },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true, // this remove the object which is null
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: OrderAzyk.collection.collectionName,
                            let: { order: '$orders' },
                            pipeline: [
                                { $match: {$expr:{$in:['$_id', '$$order']}} },
                                { $lookup:
                                    {
                                        from: ItemAzyk.collection.collectionName,
                                        let: { item: '$item' },
                                        pipeline: [
                                            { $match: {$expr:{$eq:['$$item', '$_id']}} },
                                            { $lookup:
                                                {
                                                    from: OrganizationAzyk.collection.collectionName,
                                                    let: { organization: '$organization' },
                                                    pipeline: [
                                                        { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                                                    ],
                                                    as: 'organization'
                                                }
                                            },
                                            {
                                                $unwind:{
                                                    preserveNullAndEmptyArrays : false, // this remove the object which is null
                                                    path : '$organization'
                                                }
                                            },
                                        ],
                                        as: 'item'
                                    }
                                },
                                {
                                    $unwind:{
                                        preserveNullAndEmptyArrays : false, // this remove the object which is null
                                        path : '$item'
                                    }
                                },
                            ],
                            as: 'orders'
                        }
                    }
                ])
            return invoices
        }
        else if(user.role==='агент'){
            if(date!=='') {
                let now = new Date()
                now.setDate(now.getDate() + 1)
                now.setHours(3, 0, 0, 0)
                let differenceDates = (now - dateStart) / (1000 * 60 * 60 * 24)
                if(differenceDates>3) {
                    dateStart = new Date()
                    dateEnd = new Date(dateStart)
                    dateEnd = new Date(dateEnd.setDate(dateEnd.getDate() - 3))
                }
            }
            else {
                dateEnd = new Date()
                dateEnd.setDate(dateEnd.getDate() + 1)
                dateEnd.setHours(3, 0, 0, 0)
                dateStart = new Date(dateEnd)
                dateStart.setDate(dateStart.getDate() - 3)
            }
            let clients = await DistrictAzyk
                .find({agent: user.employment})
                .distinct('client')
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match: {
                            del: {$ne: 'deleted'},
                            ...(filter !== 'консигнации' ? {} : {consignmentPrice: {$gt: 0}}),
                            client: {$in: clients},
                            $and: [
                                {createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}},
                                {
                                    $or: [
                                        {organization: user.organization},
                                        {distributer: user.organization},
                                    ],
                                },
                                {
                                    ...(search.length>0?{
                                            $or: [
                                                {number: {'$regex': search, '$options': 'i'}},
                                                {info: {'$regex': search, '$options': 'i'}},
                                                {address: {'$regex': search, '$options': 'i'}},
                                                {paymentMethod: {'$regex': search, '$options': 'i'}},
                                                {client: {$in: _clients}},
                                            ]
                                        }
                                        :{
                                        })
                                }
                            ],
                        }
                    },
                    { $sort : _sort },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: OrderAzyk.collection.collectionName,
                            let: { order: '$orders' },
                            pipeline: [
                                { $match: {$expr:{$in:['$_id', '$$order']}} },
                                { $lookup:
                                    {
                                        from: ItemAzyk.collection.collectionName,
                                        let: { item: '$item' },
                                        pipeline: [
                                            { $match: {$expr:{$eq:['$$item', '$_id']}} },
                                            { $lookup:
                                                {
                                                    from: OrganizationAzyk.collection.collectionName,
                                                    let: { organization: '$organization' },
                                                    pipeline: [
                                                        { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                                                    ],
                                                    as: 'organization'
                                                }
                                            },
                                            {
                                                $unwind:{
                                                    preserveNullAndEmptyArrays : false, // this remove the object which is null
                                                    path : '$organization'
                                                }
                                            },
                                        ],
                                        as: 'item'
                                    }
                                },
                                {
                                    $unwind:{
                                        preserveNullAndEmptyArrays : false, // this remove the object which is null
                                        path : '$item'
                                    }
                                },
                            ],
                            as: 'orders'
                        }
                    },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { distributer: '$distributer' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$distributer', '$_id']}} },
                            ],
                            as: 'distributer'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$distributer'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true, // this remove the object which is null
                            path : '$agent'
                        }
                    }
                ])
            return invoices
        }
        else if(user.role==='менеджер'){
            let clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match:{
                            del: {$ne: 'deleted'},
                            ...(filter!=='консигнации'?{}:{ consignmentPrice: { $gt: 0 }}),
                            client: {$in: clients},
                            $and: [
                                ...(date===''?[] :[{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]),
                                {
                                    $or: [
                                        {organization: user.organization},
                                        {distributer: user.organization},
                                    ]
                                },
                                {
                                    ...(search.length>0?{
                                            $or: [
                                                {number: {'$regex': search, '$options': 'i'}},
                                                {info: {'$regex': search, '$options': 'i'}},
                                                {address: {'$regex': search, '$options': 'i'}},
                                                {paymentMethod: {'$regex': search, '$options': 'i'}},
                                                {client: {$in: _clients}},
                                                {agent: {$in: _agents}},
                                            ]
                                        }
                                        :{
                                        })}],
                        }
                    },
                    { $sort : _sort },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: OrderAzyk.collection.collectionName,
                            let: { order: '$orders' },
                            pipeline: [
                                { $match: {$expr:{$in:['$_id', '$$order']}} },
                                { $lookup:
                                    {
                                        from: ItemAzyk.collection.collectionName,
                                        let: { item: '$item' },
                                        pipeline: [
                                            { $match: {$expr:{$eq:['$$item', '$_id']}} },
                                            { $lookup:
                                                {
                                                    from: OrganizationAzyk.collection.collectionName,
                                                    let: { organization: '$organization' },
                                                    pipeline: [
                                                        { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                                                    ],
                                                    as: 'organization'
                                                }
                                            },
                                            {
                                                $unwind:{
                                                    preserveNullAndEmptyArrays : false, // this remove the object which is null
                                                    path : '$organization'
                                                }
                                            },
                                        ],
                                        as: 'item'
                                    }
                                },
                                {
                                    $unwind:{
                                        preserveNullAndEmptyArrays : false, // this remove the object which is null
                                        path : '$item'
                                    }
                                },
                            ],
                            as: 'orders'
                        }
                    },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true, // this remove the object which is null
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { distributer: '$distributer' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$distributer', '$_id']}} },
                            ],
                            as: 'distributer'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$distributer'
                        }
                    },
                ])
            return invoices
        }
        else if('организация'===user.role) {
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match:{
                            del: {$ne: 'deleted'},
                            ...(filter!=='консигнации'?{}:{ consignmentPrice: { $gt: 0 }}),
                            ...(
                                date===''?{
                                    $and: [
                                        {
                                            $or: [
                                                {organization: user.organization},
                                                {distributer: user.organization},
                                            ]
                                        },
                                        {
                                            ...(search.length>0?{
                                                    $or: [
                                                        {number: {'$regex': search, '$options': 'i'}},
                                                        {info: {'$regex': search, '$options': 'i'}},
                                                        {address: {'$regex': search, '$options': 'i'}},
                                                        {paymentMethod: {'$regex': search, '$options': 'i'}},
                                                        {client: {$in: _clients}},
                                                        {agent: {$in: _agents}}
                                                    ]
                                                }
                                                :{
                                                })
                                        }
                                    ]
                                }:{ $and: [
                                    {createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}},
                                    {
                                        $or: [
                                            {organization: user.organization},
                                            {distributer: user.organization},
                                        ]
                                    },
                                    {
                                        ...(search.length>0?{
                                                $or: [
                                                    {number: {'$regex': search, '$options': 'i'}},
                                                    {info: {'$regex': search, '$options': 'i'}},
                                                    {address: {'$regex': search, '$options': 'i'}},
                                                    {paymentMethod: {'$regex': search, '$options': 'i'}},
                                                    {client: {$in: _clients}},
                                                    {agent: {$in: _agents}}
                                                ]
                                            }
                                            :{
                                            })
                                    }
                                ]}),
                        }
                    },
                    { $sort : _sort },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: OrderAzyk.collection.collectionName,
                            let: { order: '$orders' },
                            pipeline: [
                                { $match: {$expr:{$in:['$_id', '$$order']}} },
                                { $lookup:
                                    {
                                        from: ItemAzyk.collection.collectionName,
                                        let: { item: '$item' },
                                        pipeline: [
                                            { $match: {$expr:{$eq:['$$item', '$_id']}} },
                                            { $lookup:
                                                {
                                                    from: OrganizationAzyk.collection.collectionName,
                                                    let: { organization: '$organization' },
                                                    pipeline: [
                                                        { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                                                    ],
                                                    as: 'organization'
                                                }
                                            },
                                            {
                                                $unwind:{
                                                    preserveNullAndEmptyArrays : false, // this remove the object which is null
                                                    path : '$organization'
                                                }
                                            },
                                        ],
                                        as: 'item'
                                    }
                                },
                                {
                                    $unwind:{
                                        preserveNullAndEmptyArrays : false, // this remove the object which is null
                                        path : '$item'
                                    }
                                },
                            ],
                            as: 'orders'
                        }
                    },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false, // this remove the object which is null
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true, // this remove the object which is null
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { distributer: '$distributer' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$distributer', '$_id']}} },
                            ],
                            as: 'distributer'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$distributer'
                        }
                    },
                ])
            return invoices
        }
    },
    invoicesTrash: async(parent, {search, skip}, {user}) => {
        let _organizations;
        let _clients;
        let _agents;
        if(search.length>0){
            _organizations = await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _agents = await EmploymentAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
        }
        if(user.role==='admin') {
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match:{
                            del: 'deleted',
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {paymentMethod: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
                                        {agent: {$in: _agents}},
                                        {organization: {$in: _organizations}},
                                        {distributer: {$in: _organizations}},
                                    ]
                                }
                                :{})
                        }
                    },
                    { $sort : {'createdAt': -1} },
                    { $skip : skip!=undefined?skip:0 },
                    { $limit : skip!=undefined?15:10000000000 },
                    { $lookup:
                        {
                            from: ClientAzyk.collection.collectionName,
                            let: { client: '$client' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$client', '$_id']}} },
                            ],
                            as: 'client'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : false,
                            path : '$client'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { agent: '$agent' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$agent', '$_id']}} },
                            ],
                            as: 'agent'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$agent'
                        }
                    },
                    { $lookup:
                        {
                            from: OrganizationAzyk.collection.collectionName,
                            let: { distributer: '$distributer' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$distributer', '$_id']}} },
                            ],
                            as: 'distributer'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$distributer'
                        }
                    },
                    { $lookup:
                        {
                            from: OrderAzyk.collection.collectionName,
                            let: { order: '$orders' },
                            pipeline: [
                                { $match: {$expr:{$in:['$_id', '$$order']}} },
                                { $lookup:
                                    {
                                        from: ItemAzyk.collection.collectionName,
                                        let: { item: '$item' },
                                        pipeline: [
                                            { $match: {$expr:{$eq:['$$item', '$_id']}} },
                                            { $lookup:
                                                {
                                                    from: OrganizationAzyk.collection.collectionName,
                                                    let: { organization: '$organization' },
                                                    pipeline: [
                                                        { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                                                    ],
                                                    as: 'organization'
                                                }
                                            },
                                            {
                                                $unwind:{
                                                    preserveNullAndEmptyArrays : false,
                                                    path : '$organization'
                                                }
                                            },
                                        ],
                                        as: 'item'
                                    }
                                },
                                {
                                    $unwind:{
                                        preserveNullAndEmptyArrays : false,
                                        path : '$item'
                                    }
                                },
                            ],
                            as: 'orders'
                        }
                    },
                ])
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
        let distributers = await DistributerAzyk.find({
            organizations: organization
        })
        let district = null;
        if(distributers.length>0){
            for(let i=0; i<distributers.length; i++){
                let findDistrict = await DistrictAzyk.findOne({
                    organization: distributers[i].distributer,
                    client: client
                })
                if(findDistrict)
                    district = findDistrict
            }
        }
        else {
            let findDistrict = await DistrictAzyk.findOne({
                organization: organization,
                client: client
            })
            if(findDistrict)
                district = findDistrict
        }
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
                        organization: organizaiton,
                        distributer: district&&district.organization.toString()!==organization.toString()?district.organization:null
                    });
                    if(usedBonus>0) {
                        objectInvoice.allPrice -= usedBonus
                        objectInvoice.usedBonus = usedBonus
                        usedBonus = 0
                    }
                    objectInvoice = await InvoiceAzyk.create(objectInvoice);
                    let newInvoice = await InvoiceAzyk.findOne({_id: objectInvoice._id})
                        .populate({path: 'orders',populate: {path: 'item',populate: [{path: 'organization'}]}})
                        .populate({path: 'client',populate: [{path: 'user'}]})
                        .populate({path: 'agent'})
                     pubsub.publish(RELOAD_ORDER, { reloadOrder: {
                        who: user.role==='admin'?null:user._id,
                        agent: district?district.agent:undefined,
                        client: client,
                        organization: organizaiton,
                        invoice: newInvoice,
                         manager: district?district.manager:undefined,
                        type: 'ADD'
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
        }
        return {data: 'OK'};
    },
    deleteOrders: async(parent, {_id}, {user}) => {
        if(user.role==='admin'){
            let objects = await InvoiceAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].del = 'deleted'
                objects[i].save()
                let district = await DistrictAzyk.findOne({
                    organization: objects[i].organization,
                    client: objects[i].client
                })
                pubsub.publish(RELOAD_ORDER, { reloadOrder: {
                    who: user.role==='admin'?null:user._id,
                    client: objects[i].client,
                    agent: district?district.agent:undefined,
                    organization: objects[i].organization,
                    invoice: {_id: objects[i]._id},
                    manager: district?district.manager:undefined,
                    type: 'DELETE'
                } });
            }
        }
        return {data: 'OK'};
    },
    restoreOrders: async(parent, {_id}, {user}) => {
        if(user.role==='admin'){
            let objects = await InvoiceAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].del = null
                objects[i].save()
            }
        }
        return {data: 'OK'};
    },
    setOrder: async(parent, {orders, invoice}, {user}) => {
        let object = await InvoiceAzyk.findOne({_id: invoice})
            .populate({
                path: 'client'
            })
        let editor;
        if(orders.length>0&&/*orders[0].status==='обработка'&&*/(['менеджер', 'организация', 'admin', 'client', 'агент', 'суперагент'].includes(user.role))){
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

            if(object.usedBonus&&object.usedBonus>0)
                object.allPrice = Math.round(allPrice - object.usedBonus)
            else
                object.allPrice = Math.round(allPrice)
            object.allTonnage = allTonnage
            object.consignmentPrice = Math.round(consignmentPrice)
            object.allSize = allSize
            object.orders = orders.map(order=>order._id)
            await object.save();
        }
        let resInvoice = await InvoiceAzyk.findOne({_id: invoice})
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
            .populate({path: 'agent'})
            .populate({path: 'distributer'})
        if(user.role==='admin'){
            editor = 'админ'
        }
        else if(user.role==='client'){
            editor = `клиент ${resInvoice.client.name}`
        }
        else{
            let employment = await EmploymentAzyk.findOne({user: user._id})
            editor = `${user.role} ${employment.name}`
        }
        resInvoice.editor = editor
        await resInvoice.save();
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
        if(resInvoice.orders[0].item.organization.name==='ЗАО «ШОРО»'){
            object.sync = 1
            await object.save();
            if(resInvoice.orders[0].status==='принят')
                setOutXMLShoroAzyk(resInvoice)
            else if(resInvoice.orders[0].status==='отмена')
                cancelOutXMLShoroAzyk(resInvoice)
        }
        let district = await DistrictAzyk.findOne({
            organization: resInvoice.organization,
            client: resInvoice.client._id
        })
        pubsub.publish(RELOAD_ORDER, { reloadOrder: {
            who: user.role==='admin'?null:user._id,
            client: resInvoice.client._id,
            agent: district?district.agent:undefined,
            organization: resInvoice.organization,
            invoice: resInvoice,
            manager: district?district.manager:undefined,
            type: 'SET'
        } });
        return resInvoice
    },
    setInvoice: async(parent, {taken, invoice, confirmationClient, confirmationForwarder, cancelClient, cancelForwarder, paymentConsignation}, {user}) => {
        let object = await InvoiceAzyk.findOne({_id: invoice}).populate('client')
        let order = await OrderAzyk.findOne({_id: object.orders[0]._id}).populate('item')
        let admin = ['admin', 'суперагент'].includes(user.role)
        let client = 'client'===user.role&&user.client.toString()===object.client._id.toString()
        let undefinedClient = ['менеджер', 'организация', 'экспедитор', 'агент'].includes(user.role)&&!object.client.user
        let employment = ['менеджер', 'организация', 'агент', 'экспедитор'].includes(user.role)&&[order.item.organization.toString(), object.distributer?object.distributer.toString():'lol'].includes(user.organization.toString());
        if(paymentConsignation!=undefined&&(admin||undefinedClient||employment)){
            object.paymentConsignation = paymentConsignation
        }
        if(taken!=undefined&&(admin||employment)){
            object.taken = taken
            if(taken) {
                await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'принят'})
            }
            else {
                await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'обработка', returned: 0})
                object.confirmationForwarder = false
                object.confirmationClient = false
                object.sync = object.sync!==0?1:0
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
                    ['admin', 'суперагент'].includes(user.role)||
                    (user.client&&payload.reloadOrder.client.toString()===user.client.toString())||
                    (user.employment&&payload.reloadOrder.agent&&payload.reloadOrder.agent.toString()===user.employment.toString())||
                    (user.employment&&payload.reloadOrder.manager&&payload.reloadOrder.manager.toString()===user.employment.toString())||
                    (user.organization&&payload.reloadOrder.organization&&'организация'===user.role&&payload.reloadOrder.organization.toString()===user.organization.toString())
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