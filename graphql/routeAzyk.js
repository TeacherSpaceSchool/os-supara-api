const OrderAzyk = require('../models/orderAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const RouteAzyk = require('../models/routeAzyk');
const mongoose = require('mongoose');
const EmploymentAzyk = require('../models/employmentAzyk');
const randomstring = require('randomstring');

const type = `
  type Route {
    _id: ID
    createdAt: Date
    invoices: [Invoice]
    employment: Employment
    status: String
    dateStart: Date
    dateEnd: Date
    number: String
    allTonnage: Float
    allSize: Float
  }
`;

const query = `
    routes(search: String!, sort: String!, filter: String!, date: String!): [Route]
    route(_id: ID!): Route
    sortRoute: [Sort]
    filterRoute: [Filter]
`;

const mutation = `
    addRoute(invoices: [ID]!, employment: ID!, dateStart: Date!): Data,
    setRoute(_id: ID!, invoices: [ID], employment: ID, cancelInvoices: [ID], dateStart: Date): Data,
    deleteRoute(_id: [ID]!): Data
`;

const resolvers = {
    routes: async(parent, {search, sort, filter, date}, {user}) => {
        let dateStart;
        let dateEnd;
        if(date!==''){
            dateStart = new Date(date)
            dateEnd = new Date(dateStart)
            dateEnd = dateEnd.setDate(dateEnd.getDate() + 1)
        }
        if(user.role==='экспедитор'){
            let routes = await RouteAzyk.find(date===''?{status: {'$regex': filter, '$options': 'i'}}:{status: {'$regex': filter, '$options': 'i'}, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]})
                .populate({
                    path: 'invoices',
                    populate: [
                        {
                            path: 'orders',
                            populate : {
                                path : 'item',
                                populate : [
                                    { path : 'organization'}
                                ]

                            }
                        },
                        {
                            path: 'client',
                            populate : [
                                { path : 'user'}
                            ]
                        }
                    ]
                })
                .populate({
                    path: 'employment',
                    populate : [
                        { path : 'user' },
                        {path : 'organization'}
                    ],
                    match: {user: user._id}
                })
                .sort(sort)
            routes = routes.filter(route => (route.employment))
            routes = routes.filter(
                    route =>
                        route.employment &&
                        (
                            (route.number.toLowerCase()).includes(search.toLowerCase()) ||
                            (route.invoices[0].orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase())
                        )
                )
            return routes
        }
        else if(user.role==='admin') {
            let routes = await RouteAzyk.find(date===''?{status: {'$regex': filter, '$options': 'i'}}:{status: {'$regex': filter, '$options': 'i'}, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]})
                .populate({
                    path: 'invoices',
                    populate: [
                        {
                            path: 'orders',
                            populate : {
                                path : 'item',
                                populate : [
                                    { path : 'organization'}
                                ]

                            }
                        },
                        {
                            path: 'client',
                            populate : [
                                { path : 'user'}
                            ]
                        }
                    ]
                })
                .populate({
                    path: 'employment',
                    populate : [
                        { path : 'user' },
                        {path : 'organization'}
                    ]
                })
                .sort(sort)
            routes = routes.filter(route => (route.employment))
            routes = routes.filter(
                    route =>
                        route.employment &&
                        (
                            (route.number.toLowerCase()).includes(search.toLowerCase()) ||
                            (route.invoices[0].orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase())
                        )
                )

            return routes
        }
        else if(['организация', 'менеджер'].includes(user.role)) {
            let routes = await RouteAzyk.find(date===''?{status: {'$regex': filter, '$options': 'i'}}:{status: {'$regex': filter, '$options': 'i'}, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]})
                .populate({
                    path: 'invoices',
                    populate: [
                        {
                            path: 'orders',
                            populate : {
                                path : 'item',
                                populate : [
                                    { path : 'organization'}
                                ]

                            }
                        },
                        {
                            path: 'client',
                            populate : [
                                { path : 'user'}
                            ]
                        }
                    ]
                })
                .populate({
                    path: 'employment',
                    populate : [
                        { path : 'user' },
                        {path : 'organization'}
                    ],
                    match: {
                        organization: user.organization
                    }
                })
                .sort(sort)
            routes = routes.filter(route => (route.employment))
            routes = routes.filter(
                    route =>
                        route.employment &&
                        (
                            (route.number.toLowerCase()).includes(search.toLowerCase()) ||
                            (route.invoices[0].orders[0].item.organization.name.toLowerCase()).includes(search.toLowerCase())
                        )
                )
            return routes
        }
    },
    route: async(parent, {_id}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            let route = await RouteAzyk.findOne({_id: _id})
                .populate({
                    path: 'invoices',
                    populate: [
                        {
                            path: 'orders',
                            populate: {
                                path: 'item',
                                populate: [
                                    {path: 'organization'}
                                ]

                            }
                        },
                        {
                            path: 'client',
                            populate: [
                                {path: 'user'}
                            ]
                        }
                    ]
                })
                .populate({
                    path: 'employment',
                    populate: [
                        {path: 'user'},
                        {path: 'organization'}
                    ]
                })
            if (route &&
                (
                    user.role === 'admin' ||
                    (user.role === 'экспедитор' && route.employment.user._id.toString() === user._id.toString()) ||
                    (['организация', 'менеджер'].includes(user.role) && route.employment.organization._id.toString() === user.organization.toString())
                )
            )
                return route
            else return null
        } else return null
    },
    sortRoute: async(parent, ctx, {user}) => {
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
                name: 'Кубатура',
                field: 'allSize'
            },
            {
                name: 'Тоннаж',
                field: 'allTonnage'
            }
        ]
        return sort
    },
    filterRoute: async() => {
        let filter = [
            {
                name: 'Все',
                value: ''
            },
            {
                name: 'Cоздан',
                value: 'создан'
            },
            {
                name: 'Выполняется',
                value: 'выполняется'
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
    addRoute: async(parent, {invoices, employment, dateStart}, {user}) => {
        if(['менеджер', 'организация', 'admin'].includes(user.role)){
            let employmentEcspeditor = await EmploymentAzyk.findOne({_id: employment})
            if(['менеджер', 'организация'].includes(user.role)){
                if(employmentEcspeditor.organization.toString()!==user.organization.toString())
                    return {data: 'OK'};
            }
            let number = randomstring.generate({length: 12, charset: 'numeric'});
            while (await RouteAzyk.findOne({number: number}))
                number = randomstring.generate({length: 12, charset: 'numeric'});
            let allTonnage = 0
            let allSize = 0
            for(let i=0; i<invoices.length; i++){
                let invoice = await InvoiceAzyk.findById(invoices[i]);
                await OrderAzyk.updateMany({_id: {$in: invoice.orders}}, {status: 'принят', setRoute: true});
                allTonnage += invoice.allTonnage
                allSize += invoice.allSize
                invoice.taken = true
                invoice.save()
            }
            let _object = new RouteAzyk({
                invoices: invoices,
                employment: employment,
                status: 'создан',
                number: number,
                allTonnage: allTonnage,
                allSize: allSize,
                dateStart: dateStart,
                organization: employmentEcspeditor.organization
            });
            await RouteAzyk.create(_object);
        }
        return {data: 'OK'};
    },
    setRoute: async(parent, {_id, invoices, employment, cancelInvoices, dateStart}, {user}) => {
        let object = await RouteAzyk.findById(_id).populate('employment');
        if(user.role==='admin'||(['организация', 'менеджер'].includes(user.role)&&user.organization.toString()===object.employment.organization.toString())) {
            let lastEmployment = object.employment._id
            let newEmployment = employment
            if(employment&&object.status==='создан')object.employment = employment;
            if(dateStart&&object.status==='создан')object.dateStart = dateStart;
            if(cancelInvoices)
                for(let i=0; i<cancelInvoices.length; i++){
                    let cancelInvoice = await InvoiceAzyk.findById(cancelInvoices[i]);
                    cancelInvoice.taken = false
                    cancelInvoice.save()
                    await OrderAzyk.updateMany({_id: {$in: cancelInvoice.orders}}, {status: 'обработка', setRoute: false});
                }
            let allTonnage = 0
            let allSize = 0
            for(let i=0; i<invoices.length; i++){
                let invoice = await InvoiceAzyk.findById(invoices[i]).populate('orders');
                if(['обработка', 'принят'].includes(invoice.orders[0].status)){
                    invoice.taken = true
                    invoice.save()
                    allTonnage += invoice.allTonnage
                    allSize += invoice.allSize
                    invoice.orders = invoice.orders.map(element=>element._id)
                    await OrderAzyk.updateMany({_id: {$in: invoice.orders}}, {status: 'принят', setRoute: true});
                }
            }
            object.invoices = invoices;
            object.allTonnage = allTonnage;
            object.allSize = allSize
            object.save();
        }
        return {data: 'OK'}
    },
    deleteRoute: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await RouteAzyk.find({_id: {$in: _id}}).populate('invoices').populate('employment')
            for(let i=0; i<objects.length; i++){
                if(objects[i].status==='создан'){
                    for(let ii=0; ii<objects[i].invoices.length; ii++){
                        await OrderAzyk.updateMany({_id: {$in: objects[i].invoices[ii].orders}}, {status: 'обработка'});
                    }
                    await RouteAzyk.deleteMany({_id: objects[i]._id})
                }
            }
        }
        else if(['организация', 'менеджер'].includes(user.role)){
            let objects = await RouteAzyk.find({_id: {$in: _id}})
                .populate('invoices')
                .populate({
                    path: 'employment',
                    match: {
                        organization: user.organization
                    }
                })
            objects = objects.filter(object => (object.employment))
            for(let i=0; i<objects.length; i++){
                if(objects[i].status==='создан') {
                    for(let ii=0; ii<objects[i].invoices.length; ii++){
                        await OrderAzyk.updateMany({_id: {$in: objects[i].invoices[ii].orders}}, {status: 'обработка'});
                    }
                    await RouteAzyk.deleteMany({_id: objects[i]._id})
                }
            }
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;