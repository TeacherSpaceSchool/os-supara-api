const ReturnedAzyk = require('../models/returnedAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const DistributerAzyk = require('../models/distributerAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const ClientAzyk = require('../models/clientAzyk');
const mongoose = require('mongoose');
const ItemAzyk = require('../models/itemAzyk');
const randomstring = require('randomstring');
const { setOutXMLReturnedShoroAzyk, cancelOutXMLReturnedShoroAzyk } = require('../module/outXMLShoroAzyk');
const { pubsub } = require('./index');
const { withFilter } = require('graphql-subscriptions');
const RELOAD_RETURNED = 'RELOAD_RETURNED';
const HistoryReturnedAzyk = require('../models/historyReturnedAzyk');

const type = `
  type ReturnedItems {
    _id: ID
    item: String
    count: Int
    allPrice: Int
    allTonnage: Int
    allSize: Int
    weight: Int
    size: Int
    price: Int
  }
  type Returned {
    _id: ID
    createdAt: Date
    updatedAt: Date
    items: [ReturnedItems]
    client: Client
    allPrice: Int 
    info: String,
    address: [String]
    number: String
    confirmationForwarder: Boolean
    sync: Int
    cancelForwarder: Boolean
    allTonnage: Int
    allSize: Int
    editor: String
    distributer: Organization
    organization: Organization
  }
  type HistoryReturned {
    createdAt: Date
    returned: ID
    editor: String
  }
  type ReloadReturned {
    who: ID
    client: ID
    agent: ID
    organization: ID
    returned: Returned
    type: String
    manager: ID
  }
  input ReturnedItemsInput {
    _id: ID
    item: String
    count: Int
    allPrice: Int
    allTonnage: Int
    allSize: Int
    name: String
    weight: Int
    size: Int
    price: Int
  }
`;

const query = `
    returneds(search: String!, sort: String!, date: String!, skip: Int): [Returned]
    returnedsSimpleStatistic(search: String!, date: String): [String]
    returnedHistorys(returned: ID!): [HistoryReturned]
    sortReturned: [Sort]
`;

const mutation = `
    addReturned(info: String, address: [[String]], organization: ID!, items: [ReturnedItemsInput], client: ID!): Data
    setReturned(items: [ReturnedItemsInput], returned: ID, confirmationForwarder: Boolean, cancelForwarder: Boolean): Returned
    deleteReturneds(_id: [ID]!): Data
`;

const subscription  = `
    reloadReturned: ReloadReturned
`;

const resolvers = {
    returnedsSimpleStatistic: async(parent, {search, date,}, {user}) => {
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
        let returneds = [];
        if(search.length>0){
            _organizations = await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
        }
        if(user.role==='агент'){
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
            returneds =  await ReturnedAzyk.find(
                {
                    del: {$ne: 'deleted'},
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
                    client: {$in: clients},
                    confirmationForwarder: true
                }
            )
                .lean()
        }
        else if(user.role==='менеджер'){
            let clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            returneds =  await ReturnedAzyk.find(
                {
                    del: {$ne: 'deleted'},
                    client: {$in: clients},
                    ...(date === '' ? {$and: [
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
                                    ]
                                }
                                :{
                                })
                        }
                    ]} : {$and: [
                        {createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}},
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
                                    ]
                                }
                                :{
                                })
                        }
                        ]}),
                    confirmationForwarder: true,
                }
            )
                .lean()
        }
        else if(user.role==='admin') {
            returneds =  await ReturnedAzyk.find(
                            {
                                del: {$ne: 'deleted'},
                                ...(date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                                confirmationForwarder: true,
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
                                        {organization: {$in: _organizations}},
                                        {distributer: {$in: _organizations}},
                                    ]
                                }
                                :{})
                        }
                    )
                .lean()
        }
        else if(['организация'].includes(user.role)) {
            returneds =  await ReturnedAzyk.find(
                {
                    del: {$ne: 'deleted'},
                    confirmationForwarder: true,
                    ...(date === '' ? {
                        $and: [
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
                                        ]
                                    }
                                    :{
                                    })
                            }
                        ]
                    } : {$and: [
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
                                    ]
                                }
                                :{
                                })
                        }
                    ]}),
                })
                .lean()
        }
        let tonnage = 0;
        let size = 0;
        let price = 0;
        let lengthList = 0;
        for(let i=0; i<returneds.length; i++){
            if(!returneds[i].cancelForwarder) {
                price += returneds[i].allPrice
                if (returneds[i].allSize)
                    size += returneds[i].allSize
                lengthList += 1
                if (returneds[i].allTonnage)
                    tonnage += returneds[i].allTonnage
            }
        }
        return [lengthList.toString(), price.toString(), tonnage.toString(), size.toString()]
    },
    returneds: async(parent, {search, sort, date, skip}, {user}) => {
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
        if(search.length>0){
            _organizations = await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
            _clients = await ClientAzyk.find({
                name: {'$regex': search, '$options': 'i'}
            }).distinct('_id')
        }
        if(user.role==='admin') {
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match:{
                            del: {$ne: 'deleted'},
                            ...(date === '' ? {} : {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}),
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
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
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                ])
            return returneds
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
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match: {
                            del: {$ne: 'deleted'},
                            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                            ...(search.length>0?{
                                    $or: [
                                        {number: {'$regex': search, '$options': 'i'}},
                                        {info: {'$regex': search, '$options': 'i'}},
                                        {address: {'$regex': search, '$options': 'i'}},
                                        {client: {$in: _clients}},
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
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                ])
            return returneds
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
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match: {
                            del: {$ne: 'deleted'},
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
                            client: {$in: clients},
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
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
                        }
                    },
                ])
            return returneds
        }
        else if(user.role==='менеджер'){
            if(date!=='') {
                let now = new Date()
                now.setHours(3, 0, 0, 0)
                now.setDate(now.getDate() + 1)
                let differenceDates = (now - dateStart) / (1000 * 60 * 60 * 24)
                if(differenceDates>3) {
                    dateStart = new Date()
                    dateEnd = new Date(dateStart)
                    dateEnd.setDate(dateEnd.getDate() - 3)
                }
            }
            else {
                dateEnd = new Date()
                dateEnd.setHours(3, 0, 0, 0)
                dateEnd.setDate(dateEnd.getDate() + 1)
                dateStart = new Date(dateEnd)
                dateStart.setDate(dateStart.getDate() - 3)
            }
            let clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match:{
                            del: {$ne: 'deleted'},
                            client: {$in: clients},
                            ...(date === '' ? {$and: [
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
                                            ]
                                        }
                                        :{
                                        })
                                }
                            ]} : {$and: [
                                {createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}},
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
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
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
            return returneds
        }
        else if('организация'===user.role) {
            let returneds =  await ReturnedAzyk.aggregate(
                [
                    {
                        $match:{
                            del: {$ne: 'deleted'},
                            ...(date === '' ? {
                                $and: [
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
                                                ]
                                            }
                                            :{
                                            })
                                    }
                                ]
                            } : {$and: [
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
                            let: { organization: '$organization' },
                            pipeline: [
                                { $match: {$expr:{$eq:['$$organization', '$_id']}} },
                            ],
                            as: 'organization'
                        }
                    },
                    {
                        $unwind:{
                            preserveNullAndEmptyArrays : true,
                            path : '$organization'
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
            return returneds
        }
    },
    returnedHistorys: async(parent, {returned}, {user}) => {
        if(['admin', 'организация', 'менеджер'].includes(user.role)){
            let historyReturneds =  await HistoryReturnedAzyk.find({returned: returned})
            return historyReturneds
        }
    },
    sortReturned: async() => {
        let sort = [
            {
                name: 'Дата',
                field: 'createdAt'
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
            }
        ]
        return sort
    },
};

const resolversMutation = {
    addReturned: async(parent, {info, address, organization, client, items}, {user}) => {
        let distributers = await DistributerAzyk.find({
            organizations: organization
        })
        let district = null;
        let allPrice = 0
        let allTonnage = 0
        let allSize = 0
        let number = randomstring.generate({length: 12, charset: 'numeric'});
        while (await ReturnedAzyk.findOne({number: number}))
            number = randomstring.generate({length: 12, charset: 'numeric'});
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
        for(let i = 0; i< items.length; i++){
            allPrice+=items[i].allPrice
            allSize+=items[i].allSize
            allTonnage+=items[i].allTonnage
        }
        let objectReturned = new ReturnedAzyk({
            items: items,
            client: client,
            allPrice: allPrice,
            allTonnage: allTonnage,
            allSize: allSize,
            number: number,
            info: info,
            address: address,
            organization: organization,
            distributer: district&&district.organization.toString()!==organization.toString()?district.organization:null
        });
        objectReturned = await ReturnedAzyk.create(objectReturned);
        pubsub.publish(RELOAD_RETURNED, { reloadReturned: {
            who: user.role==='admin'?null:user._id,
            agent: district?district.agent:null,
            client: client,
            organization: organization,
            returned: objectReturned,
            manager: district?district.manager:undefined,
            type: 'ADD'
        } });
        return {data: 'OK'};
    },
    deleteReturneds: async(parent, {_id}, {user}) => {
        if(user.role==='admin'){
            let objects = await ReturnedAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                let findDistrict = await DistrictAzyk.findOne({
                    organization: objects[i].organization,
                    client: objects[i].client
                })
                objects[i].del = 'deleted'
                objects[i].save()
                pubsub.publish(RELOAD_RETURNED, { reloadReturned: {
                    who: user.role==='admin'?null:user._id,
                    client: objects[i].client,
                    agent: findDistrict?findDistrict.agent:null,
                    organization: objects[i].organization,
                    returned: {_id: objects[i]._id},
                    manager: findDistrict?findDistrict.manager:undefined,
                    type: 'DELETE'
                } });
            }
        }
        return {data: 'OK'};
    },
    setReturned: async(parent, {items, returned, confirmationForwarder, cancelForwarder}, {user}) => {
        let object = await ReturnedAzyk.findOne({_id: returned})
            .populate({
                path: 'client'
            })
            .populate({path: 'organization'})
            .populate({path: 'distributer'});
        let district = null;
        let distributers = await DistributerAzyk.find({
            organizations: object.organization._id
        })
        if(distributers.length>0){
            for(let i=0; i<distributers.length; i++){
                let findDistrict = await DistrictAzyk.findOne({
                    organization: distributers[i].distributer,
                    client: object.client._id
                })
                if(findDistrict)
                    district = findDistrict
            }
        }
        else {
            let findDistrict = await DistrictAzyk.findOne({
                organization: object.organization._id,
                client: object.client._id
            })
            if(findDistrict)
                district = findDistrict
        }
        let editor;
        if(items.length>0&&(['менеджер', 'организация', 'admin', 'агент', 'суперагент'].includes(user.role))){
            let allPrice = 0
            let allTonnage = 0
            let allSize = 0
            for(let i=0; i<items.length;i++){
                allPrice += items[i].allPrice
                allTonnage += items[i].allTonnage
                allSize += items[i].allSize
            }

            object.allPrice = Math.round(allPrice)
            object.allTonnage = allTonnage
            object.allSize = allSize
            object.items = items
        }
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
        object.editor = editor
        if(!object.cancelForwarder&&confirmationForwarder!=undefined){
            object.confirmationForwarder = confirmationForwarder
        }
        if(!object.confirmationForwarder&&cancelForwarder!=undefined){
            if(cancelForwarder){
                object.cancelForwarder = true
            }
            else if(!cancelForwarder) {
                object.cancelForwarder = false
            }
        }
        await object.save();
        if(object.organization.name==='ЗАО «ШОРО»'){
            if(object.confirmationForwarder) {
                setOutXMLReturnedShoroAzyk(object)
            }
            else if(object.cancelForwarder) {
                cancelOutXMLReturnedShoroAzyk(object)
            }
        }
        let objectHistoryReturned = new HistoryReturnedAzyk({
            returned: returned,
            editor: editor,
        });
        await HistoryReturnedAzyk.create(objectHistoryReturned);
        pubsub.publish(RELOAD_RETURNED, { reloadReturned: {
            who: user.role==='admin'?null:user._id,
            client: object.client._id,
            agent: district?district.agent:null,
            organization: object.organization._id,
            returned: object,
            manager: district?district.manager:undefined,
            type: 'SET'
        } });
        return object
    }
};

const resolversSubscription = {
    reloadReturned: {
        subscribe: withFilter(
            () => pubsub.asyncIterator(RELOAD_RETURNED),
            (payload, variables, {user} ) => {
                return (
                    ['admin', 'суперагент'].includes(user.role)||
                    (user.employment&&payload.reloadReturned.agent&&payload.reloadReturned.agent.toString()===user.employment.toString())||
                    (user.employment&&payload.reloadReturned.manager&&payload.reloadReturned.manager.toString()===user.employment.toString())||
                    (user.organization&&payload.reloadReturned.organization&&'организация'===user.role&&payload.reloadReturned.organization.toString()===user.organization.toString())
                )
            },
        )
    },

}

module.exports.RELOAD_RETURNED = RELOAD_RETURNED;
module.exports.resolversSubscription = resolversSubscription;
module.exports.subscription = subscription;
module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;