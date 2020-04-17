const OrderAzyk = require('../models/orderAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const DistributerAzyk = require('../models/distributerAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const RouteAzyk = require('../models/routeAzyk');
const BasketAzyk = require('../models/basketAzyk');
const ClientAzyk = require('../models/clientAzyk');
const AdsAzyk = require('../models/adsAzyk');
const mongoose = require('mongoose');
const ItemAzyk = require('../models/itemAzyk');
const { addBonusToClient } = require('../module/bonusClientAzyk');
const randomstring = require('randomstring');
const BonusClientAzyk = require('../models/bonusClientAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const { setOutXMLShoroAzyk, cancelOutXMLShoroAzyk, setOutXMLShoroAzykLogic } = require('../module/outXMLShoroAzyk');
const BonusAzyk = require('../models/bonusAzyk');
const { pubsub } = require('./index');
const { withFilter } = require('graphql-subscriptions');
const RELOAD_ORDER = 'RELOAD_ORDER';
const HistoryOrderAzyk = require('../models/historyOrderAzyk');

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
    district: String
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
    adss: [Ads]
    track: Int
    forwarder: Employment
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
    invoicesFromDistrict(organization: ID!, district: ID!, date: String!): [Invoice]
   invoicesSimpleStatistic(search: String!, filter: String!, date: String): [String]
    invoicesTrash(search: String!, skip: Int): [Invoice]
   invoicesTrashSimpleStatistic(search: String!): [String]
    orderHistorys(invoice: ID!): [HistoryOrder]
    invoicesForRouting(organization: ID): [Invoice]
    invoice(_id: ID!): Invoice
    sortInvoice: [Sort]
    filterInvoice: [Filter]
    isOrderToday(organization: ID!): Boolean
`;

const mutation = `
    addOrders(info: String, usedBonus: Boolean, noSplit: Boolean, paymentMethod: String, address: [[String]], organization: ID!, client: ID!): Data
    setOrder(orders: [OrderInput], invoice: ID): Invoice
    setInvoice(adss: [ID], taken: Boolean, invoice: ID!, confirmationClient: Boolean, confirmationForwarder: Boolean, cancelClient: Boolean, cancelForwarder: Boolean, paymentConsignation: Boolean): Data
    setInvoicesLogic(track: Int, forwarder: ID, invoices: [ID]!): Data
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
            }).distinct('_id').lean()
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id').lean()
            _agents = await EmploymentAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id').lean()
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
            }).distinct('_id').lean()
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id').lean()
            _agents = await EmploymentAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id').lean()
        }
        let invoices = [];
        if(filter !== 'обработка'){
            if(user.role==='client'){
                invoices =  await InvoiceAzyk.find(
                    {
                        del: {$ne: 'deleted'},
                        taken: true,
                        ...(date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                        ...(filter === 'консигнации' ? {consignmentPrice: {$gt: 0}} : {}),
                        ...(filter === 'акция' ? {adss: {$ne: []}} : {}),
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
                        ...(filter === 'консигнации' ? {consignmentPrice: {$gt: 0}} : {}),
                        ...(filter === 'акция' ? {adss: {$ne: []}} : {}),
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
            else if('организация'===user.role) {
                invoices =  await InvoiceAzyk.find(
                    {
                        del: {$ne: 'deleted'},
                        taken: true,
                        ...(filter === 'консигнации' ? {consignmentPrice: {$gt: 0}} : {}),
                        ...(filter === 'акция' ? {adss: {$ne: []}} : {}),
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
                        ...(filter === 'консигнации' ? {consignmentPrice: {$gt: 0}} : {}),
                        ...(filter === 'акция' ? {adss: {$ne: []}} : {}),
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
                        ...(filter === 'консигнации' ? {consignmentPrice: {$gt: 0}} : {}),
                        ...(filter === 'акция' ? {adss: {$ne: []}} : {}),
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
            }).distinct('_id').lean()
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id').lean()
            _agents = await EmploymentAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id').lean()
        }
        if(user.role==='admin') {
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match:{
                            del: {$ne: 'deleted'},
                            ...(date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                            ...(filter === 'консигнации' ? {consignmentPrice: {$gt: 0}} : {}),
                            ...(filter === 'акция' ? {adss: {$ne: []}} : {}),
                            ...(filter === 'обработка' ? {taken: false, cancelClient: null, cancelForwarder: null} : {}),
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
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
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
                    { $lookup:
                        {
                            from: AdsAzyk.collection.collectionName,
                            let: { adss: '$adss' },
                            pipeline: [
                                { $match: {$expr: {$in:['$_id', '$$adss']}}},
                            ],
                            as: 'adss'
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
        else if(user.role==='client'){
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match: {
                            del: {$ne: 'deleted'},
                            ...(date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                            ...(filter === 'консигнации' ? {consignmentPrice: {$gt: 0}} : {}),
                            ...(filter === 'акция' ? {adss: {$ne: []}} : {}),
                            ...(filter === 'обработка' ? {taken: false, cancelClient: null, cancelForwarder: null} : {}),
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
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
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
                    { $lookup:
                        {
                            from: AdsAzyk.collection.collectionName,
                            let: { adss: '$adss' },
                            pipeline: [
                                { $match: {$expr: {$in:['$_id', '$$adss']}}},
                            ],
                            as: 'adss'
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
                            ...(filter === 'консигнации' ? {consignmentPrice: {$gt: 0}} : {}),
                            ...(filter === 'обработка' ? {taken: false, cancelClient: null, cancelForwarder: null} : {}),
                            ...(filter === 'акция' ? {adss: {$ne: []}} : {}),
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
                            from: AdsAzyk.collection.collectionName,
                            let: { adss: '$adss' },
                            pipeline: [
                                { $match: {$expr: {$in:['$_id', '$$adss']}}},
                            ],
                            as: 'adss'
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
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
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
                            client: {$in: clients},
                            ...(filter === 'консигнации' ? {consignmentPrice: {$gt: 0}} : {}),
                            ...(filter === 'акция' ? {adss: {$ne: []}} : {}),
                            ...(filter === 'обработка' ? {taken: false, cancelClient: null, cancelForwarder: null} : {}),
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
                            from: AdsAzyk.collection.collectionName,
                            let: { adss: '$adss' },
                            pipeline: [
                                { $match: {$expr: {$in:['$_id', '$$adss']}}}
                            ],
                            as: 'adss'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
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
                            client: {$in: clients},
                            ...(filter === 'консигнации' ? {consignmentPrice: {$gt: 0}} : {}),
                            ...(filter === 'акция' ? {adss: {$ne: []}} : {}),
                            ...(filter === 'обработка' ? {taken: false, cancelClient: null, cancelForwarder: null} : {}),
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
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
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
                            from: AdsAzyk.collection.collectionName,
                            let: { adss: '$adss' },
                            pipeline: [
                                { $match: {$expr: {$in:['$_id', '$$adss']}}},
                            ],
                            as: 'adss'
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
                            ...(filter === 'консигнации' ? {consignmentPrice: {$gt: 0}} : {}),
                            ...(filter === 'акция' ? {adss: {$ne: []}} : {}),
                            ...(filter === 'обработка' ? {taken: false, cancelClient: null, cancelForwarder: null} : {}),
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
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
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
                            from: AdsAzyk.collection.collectionName,
                            let: { adss: '$adss' },
                            pipeline: [
                                { $match: {$expr: {$in:['$_id', '$$adss']}}},
                            ],
                            as: 'adss'
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
            }).distinct('_id').lean()
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id').lean()
            _agents = await EmploymentAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id').lean()
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
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
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
                            from: AdsAzyk.collection.collectionName,
                            let: { adss: '$adss' },
                            pipeline: [
                                { $match: {$expr: {$in:['$_id', '$$adss']}}},
                            ],
                            as: 'adss'
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
    isOrderToday: async(parent, {organization}, {user}) => {
        if('client'===user.role){
            let dateStart = new Date()
            if(dateStart.getHours()<3)
                dateStart.setDate(dateStart.getDate() - 1)
            dateStart.setHours(3, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            let objectInvoice = await InvoiceAzyk.findOne({
                organization: organization,
                client: user.client,
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                del: {$ne: 'deleted'},
                cancelClient: null,
                cancelForwarder: null
            }).sort('-createdAt')
            return !!objectInvoice
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
            /*{
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
            },*/
            {
                name: 'Консигнации',
                value: 'консигнации'
            },
            {
                name: 'Акции',
                value: 'акция'
            }
        ]
        if(user.role)
            filter.push()
        return filter
    },
    invoicesFromDistrict: async(parent, {organization, district, date}, {user}) =>  {
        let dateStart;
        let dateEnd;
        dateStart = new Date(date)
        dateStart.setHours(3, 0, 0, 0)
        dateEnd = new Date(dateStart)
        dateEnd.setDate(dateEnd.getDate() + 1)
        let _clients = await DistrictAzyk.findOne({
            _id: district
        }).distinct('client');
        if(user.role==='admin') {
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match:{
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                            taken: true,
                            del: {$ne: 'deleted'},
                            client: {$in: _clients},
                            $or: [
                                {organization: new mongoose.Types.ObjectId(organization)},
                                {distributer: new mongoose.Types.ObjectId(organization)},
                            ]
                        }
                    },
                    { $sort : {createdAt: -1} },
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
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
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
                    { $lookup:
                        {
                            from: AdsAzyk.collection.collectionName,
                            let: { adss: '$adss' },
                            pipeline: [
                                { $match: {$expr: {$in:['$_id', '$$adss']}}},
                            ],
                            as: 'adss'
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
        else if(user.role==='агент'){
            let now = new Date()
            now.setDate(now.getDate() + 1)
            now.setHours(3, 0, 0, 0)
            let differenceDates = (now - dateStart) / (1000 * 60 * 60 * 24)
            if(differenceDates>3) {
                dateStart = new Date()
                dateEnd = new Date(dateStart)
                dateEnd = new Date(dateEnd.setDate(dateEnd.getDate() - 3))
            }
            _clients = await DistrictAzyk
                .find({agent: user.employment})
                .distinct('client')
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match: {
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                            taken: true,
                            del: {$ne: 'deleted'},
                            client: {$in: _clients},
                            $or: [
                                {organization: user.organization},
                                {distributer: user.organization},
                            ]
                        }
                    },
                    { $sort : {createdAt: -1} },
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
                            from: AdsAzyk.collection.collectionName,
                            let: { adss: '$adss' },
                            pipeline: [
                                { $match: {$expr: {$in:['$_id', '$$adss']}}}
                            ],
                            as: 'adss'
                        }
                    },
                    { $lookup:
                        {
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
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
            _clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            let invoices =  await InvoiceAzyk.aggregate(
                [
                    {
                        $match:{
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                            taken: true,
                            del: {$ne: 'deleted'},
                            client: {$in: _clients},
                            $or: [
                                {organization: user.organization},
                                {distributer: user.organization},
                            ]
                        }
                    },
                    { $sort : {createdAt: -1} },
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
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
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
                            from: AdsAzyk.collection.collectionName,
                            let: { adss: '$adss' },
                            pipeline: [
                                { $match: {$expr: {$in:['$_id', '$$adss']}}},
                            ],
                            as: 'adss'
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
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                            taken: true,
                            del: {$ne: 'deleted'},
                            client: {$in: _clients},
                            $or: [
                                {organization: user.organization},
                                {distributer: user.organization},
                            ]
                        }
                    },
                    { $sort : {createdAt: -1} },
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
                            from: EmploymentAzyk.collection.collectionName,
                            let: { forwarder: '$forwarder' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$forwarder', '$_id']}} },
                            ],
                            as: 'forwarder'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$forwarder'
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
                            from: AdsAzyk.collection.collectionName,
                            let: { adss: '$adss' },
                            pipeline: [
                                { $match: {$expr: {$in:['$_id', '$$adss']}}},
                            ],
                            as: 'adss'
                        }
                    },
                ])
            return invoices
        }
    },
};

const resolversMutation = {
    addOrders: async(parent, {info, paymentMethod, address, organization, usedBonus, client, noSplit}, {user}) => {
        if(user.client)
            client = user.client
        let baskets = await BasketAzyk.find(
            user.client?
                {client: user.client}:
                {agent: user.employment}
        )
            .populate({
                path: 'item',
                match: {organization: organization}
            });
        baskets = baskets.filter(basket => (basket.item))
        if(baskets.length>0){
            let dateStart = new Date()
            if(dateStart.getHours()<3)
                dateStart.setDate(dateStart.getDate() - 1)
            dateStart.setHours(3, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
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
            if(!district) {
                let findDistrict = await DistrictAzyk.findOne({
                    organization: organization,
                    client: client
                })
                if(findDistrict)
                    district = findDistrict
            }
            let objectInvoice;
            if(!noSplit)
                objectInvoice = await InvoiceAzyk.findOne({
                    organization: organization,
                    client: client,
                    $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                    del: {$ne: 'deleted'},
                    cancelClient: null,
                    cancelForwarder: null
                }).populate('client').sort('-createdAt')
            if(!objectInvoice){
                if(usedBonus){
                    let bonus = await BonusAzyk.findOne({organization: organization});
                    let bonusClient = await BonusClientAzyk.findOne({client: client, bonus: bonus._id})
                    usedBonus = bonusClient.addedBonus;
                    bonusClient.addedBonus = 0
                    await bonusClient.save();
                }
                else
                    usedBonus=0
                let orders = [];
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
                    orders.push(objectOrder);
                }
                let number = randomstring.generate({length: 12, charset: 'numeric'});
                while (await InvoiceAzyk.findOne({number: number}))
                    number = randomstring.generate({length: 12, charset: 'numeric'});
                let allPrice = 0
                let allTonnage = 0
                let allSize = 0
                let consignmentPrice = 0
                for(let iii=0; iii<orders.length;iii++) {
                    allPrice += orders[iii].allPrice
                    consignmentPrice += orders[iii].consignmentPrice
                    allTonnage += orders[iii].allTonnage
                    allSize += orders[iii].allSize
                    orders[iii] = orders[iii]._id
                }
                objectInvoice = new InvoiceAzyk({
                    orders: orders,
                    client: client,
                    allPrice: Math.round(allPrice),
                    consignmentPrice: Math.round(consignmentPrice),
                    allTonnage: Math.round(allTonnage),
                    allSize: Math.round(allSize),
                    info: info,
                    address: address[0],
                    paymentMethod: paymentMethod,
                    number: number,
                    agent: user.employment,
                    organization: organization,
                    adss: [],
                    track: 1,
                    forwarder: district?district.ecspeditor:null,
                    district:  district?district.name:null,
                    distributer: district&&district.organization.toString()!==organization.toString()?district.organization:null
                });
                if(usedBonus>0) {
                    objectInvoice.allPrice -= usedBonus
                    objectInvoice.usedBonus = usedBonus
                    usedBonus = 0
                }
                objectInvoice = await InvoiceAzyk.create(objectInvoice);
            }
            else {
                for(let ii=0; ii<baskets.length;ii++){
                    let objectOrder = await OrderAzyk.findOne({
                        item: baskets[ii].item._id,
                        _id: {$in: objectInvoice.orders},
                    })
                    if(objectOrder){
                        objectOrder.count+=baskets[ii].count
                        objectOrder.consignment+=baskets[ii].consignment
                        objectOrder.consignmentPrice+=Math.round(baskets[ii].consignment*(baskets[ii].item.stock?baskets[ii].item.stock:baskets[ii].item.price))
                        objectOrder.allTonnage+=Math.round(baskets[ii].count*(baskets[ii].item.weight?baskets[ii].item.weight:0))
                        objectOrder.allSize+=Math.round(baskets[ii].count*(baskets[ii].item.size?baskets[ii].item.size:0))
                        objectOrder.allPrice+=Math.round(baskets[ii].count*(baskets[ii].item.stock?baskets[ii].item.stock:baskets[ii].item.price))
                        await objectOrder.save()
                    }
                    else {
                        objectOrder = new OrderAzyk({
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
                        objectInvoice.orders.push(objectOrder);
                    }
                    objectInvoice.allPrice+=Math.round(baskets[ii].count*(baskets[ii].item.stock?baskets[ii].item.stock:baskets[ii].item.price))
                    objectInvoice.allTonnage+=Math.round(baskets[ii].count*(baskets[ii].item.weight?baskets[ii].item.weight:0))
                    objectInvoice.allSize+=Math.round(baskets[ii].count*(baskets[ii].item.size?baskets[ii].item.size:0))
                    objectInvoice.consignmentPrice+=Math.round(baskets[ii].consignment*(baskets[ii].item.stock?baskets[ii].item.stock:baskets[ii].item.price))
                }
                await OrderAzyk.updateMany({_id: {$in: objectInvoice.orders}}, {status: 'обработка', returned: 0})
                objectInvoice.confirmationForwarder = false
                objectInvoice.confirmationClient = false
                objectInvoice.taken = false
                objectInvoice.sync = 0
                objectInvoice.orders = objectInvoice.orders.map(order=>order._id)
                let editor
                if(user.role==='admin'){
                    editor = 'админ'
                }
                else if(user.role==='client'){
                    editor = `клиент ${objectInvoice.client.name}`
                }
                else{
                    let employment = await EmploymentAzyk.findOne({user: user._id})
                    editor = `${user.role} ${employment.name}`
                }
                objectInvoice.editor = editor
                await objectInvoice.save();
                let objectHistoryOrder = new HistoryOrderAzyk({
                    invoice: objectInvoice._id,
                    orders: objectInvoice.orders.map(order=>{
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
            }
            let newInvoice = await InvoiceAzyk.findOne({_id: objectInvoice._id})
                .populate({path: 'orders',populate: {path: 'item',populate: [{path: 'organization'}]}})
                .populate({path: 'client',populate: [{path: 'user'}]})
                .populate({path: 'agent'})
                .populate({path: 'distributer'})
                .populate({path: 'forwarder'})
            pubsub.publish(RELOAD_ORDER, { reloadOrder: {
                who: user.role==='admin'?null:user._id,
                agent: district?district.agent:undefined,
                client: client,
                organization: organization,
                invoice: newInvoice,
                manager: district?district.manager:undefined,
                type: 'ADD'
            } });
            if(user.client) {
                for (let i = 0; i < baskets.length; i++) {
                    let object = await ItemAzyk.findOne({_id: baskets[i].item})
                    let index = object.basket.indexOf(user._id)
                    object.basket.splice(index, 1)
                    await object.save()
                }
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
                await objects[i].save()
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
                await objects[i].save()
            }
        }
        return {data: 'OK'};
    },
    setInvoicesLogic: async(parent, {track, forwarder, invoices}, {user}) => {
        await setOutXMLShoroAzykLogic(invoices, forwarder, track)
        let resInvoices = await InvoiceAzyk.find({_id: {$in: invoices}})
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
            .populate({path: 'adss'})
            .populate({path: 'forwarder'})
        if(resInvoices.length>0){
            let district = await DistrictAzyk.findOne({
                organization: resInvoices[0].organization,
                client: resInvoices[0].client._id
            })
            for(let i=0; i<resInvoices.length; i++){
                pubsub.publish(RELOAD_ORDER, { reloadOrder: {
                    who: user.role==='admin'?null:user._id,
                    client: resInvoices[i].client._id,
                    agent: district?district.agent:undefined,
                    organization: resInvoices[i].organization,
                    invoice: resInvoices[i],
                    manager: district?district.manager:undefined,
                    type: 'SET'
                } });
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
        if(orders.length>0&&(['менеджер', 'организация', 'admin', 'client', 'агент', 'суперагент'].includes(user.role))){
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
            .populate({path: 'adss'})
            .populate({path: 'forwarder'})
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
            if(resInvoice.orders[0].status==='принят') {
                await setOutXMLShoroAzyk(resInvoice)
            }
            else if(resInvoice.orders[0].status==='отмена') {
                await cancelOutXMLShoroAzyk(resInvoice)
            }
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
    setInvoice: async(parent, {adss, taken, invoice, confirmationClient, confirmationForwarder, cancelClient, cancelForwarder, paymentConsignation}, {user}) => {
        let object = await InvoiceAzyk.findOne({_id: invoice}).populate('client').populate('order')
        let order = await OrderAzyk.findOne({_id: object.orders[0]._id}).populate('item')
        let admin = ['admin', 'суперагент'].includes(user.role)
        let client = 'client'===user.role&&user.client.toString()===object.client._id.toString()
        let undefinedClient = ['менеджер', 'организация', 'экспедитор', 'агент'].includes(user.role)&&!object.client.user
        let employment = ['менеджер', 'организация', 'агент', 'экспедитор'].includes(user.role)&&[order.item.organization.toString(), object.distributer?object.distributer.toString():'lol'].includes(user.organization.toString());
        if(adss!=undefined&&(admin||undefinedClient||employment)) {
            object.adss = adss
        }
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
                object.dateDelivery = null
                object.sync = object.sync!==0?1:0
            }
        }
        if(object.taken&&confirmationClient!=undefined&&(admin||undefinedClient||client)){
            object.confirmationClient = confirmationClient
            if(!confirmationClient) {
                await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'принят'})
                object.dateDelivery = null
            }
        }
        if(object.taken&&confirmationForwarder!=undefined&&(admin||employment)){
            object.confirmationForwarder = confirmationForwarder
            if(!confirmationForwarder) {
                await OrderAzyk.updateMany({_id: {$in: object.orders}}, {status: 'принят'})
                object.dateDelivery = null
            }
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
                await route.save();
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
                    user._id.toString()!==payload.reloadOrder.who&&
                    (['admin', 'суперагент'].includes(user.role)||
                    (user.client&&payload.reloadOrder.client.toString()===user.client.toString())||
                    (user.employment&&payload.reloadOrder.agent&&payload.reloadOrder.agent.toString()===user.employment.toString())||
                    (user.employment&&payload.reloadOrder.manager&&payload.reloadOrder.manager.toString()===user.employment.toString())||
                    (user.organization&&payload.reloadOrder.organization&&'организация'===user.role&&payload.reloadOrder.organization.toString()===user.organization.toString()))
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