const InvoiceAzyk = require('../models/invoiceAzyk');
const ItemAzyk = require('../models/itemAzyk');
const OrderAzyk = require('../models/orderAzyk');
const ClientAzyk = require('../models/clientAzyk');

const type = `
    type Statistic {
        columns: [String]
        row: [StatisticData]
    }
    type StatisticData {
        _id: ID
        data: [String]
    }
    type GeoStatistic {
        client: ID
        address: [String]
        data: [String]
    }
`;

const query = `
    statisticClient(company: String, dateStart: Date): Statistic
    statisticItem(company: String, dateStart: Date): Statistic
    activeItem(organization: ID!): [Item]
    activeOrganization: [Organization]
    statisticClientGeo(organization: ID, item: ID): [GeoStatistic]
`;

const resolvers = {
    statisticClient: async(parent, { company, dateStart }, {user}) => {
        if(user.role==='admin'){
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateEnd = new Date(dateStart)
                dateEnd.setMonth(dateEnd.getMonth() + 1)
            }

            let statistic = {}
            let data = await InvoiceAzyk.find(
                {
                    $and: [
                        dateStart?{createdAt: {$gte: dateStart}}:{},
                        dateEnd?{createdAt: {$lt: dateEnd}}:{}
                    ],
                    ...{del: {$ne: 'deleted'}}
                }
            )
                .populate({
                    path: 'orders',
                    populate : [
                        {
                            path : 'item',
                            match: company==='all'?{}:{ organization: company }
                        },
                        {
                            path : 'client',
                            match: { organization: null }
                        }
                    ]
                })
            data = data.filter(data =>data.orders.length>0&&data.orders[0].item&&data.orders[0].client)
            data = data.reduce((acc, val) => acc.concat(val.orders), []);


            for(let i=0; i<data.length; i++) {
                if (data[i].status !== 'обработка'&&!(data[i].client.name.toLowerCase()).includes('агент')&&!(clients[x].name.toLowerCase()).includes('agent')) {
                    if (!statistic[data[i].client._id])
                        statistic[data[i].client._id] = {
                            profit: 0,
                            cancel: 0,
                            complet: 0,
                            consignmentPrice: 0,
                            client: data[i].client.name
                        }
                    if (data[i].status === 'отмена')
                        statistic[data[i].client._id].cancel += 1
                    else {
                        statistic[data[i].client._id].complet += 1
                        statistic[data[i].client._id].profit += (data[i].allPrice - data[i].returned * (data[i].item.stock ? data[i].item.stock : data[i].item.price))
                        if (data[i].consignmentPrice && !data[i].paymentConsignation) {
                            statistic[data[i].client._id].consignmentPrice += data[i].consignmentPrice
                        }
                    }
                }
            }
            const keys = Object.keys(statistic)
            data = []

            let profitAll = 0
            let consignmentPriceAll = 0
            let completAll = 0
            let cancelAll = 0

            for(let i=0; i<keys.length; i++){
                profitAll += statistic[keys[i]].profit,
                    consignmentPriceAll += statistic[keys[i]].consignmentPrice,
                    completAll += statistic[keys[i]].complet,
                    cancelAll += statistic[keys[i]].cancel,
                    data.push({
                        _id: keys[i],
                        data: [
                            statistic[keys[i]].client,
                            statistic[keys[i]].profit,
                            statistic[keys[i]].consignmentPrice,
                            statistic[keys[i]].complet,
                            statistic[keys[i]].cancel,
                        ]
                    })
            }
            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: null,
                    data: [
                        data.length,
                        profitAll,
                        consignmentPriceAll,
                        completAll,
                        cancelAll,
                    ]
                },
                ...data
            ]
            return {
                columns: ['клиент', 'прибыль(сом)', 'конс(сом)', 'выполнен(шт)', 'отмена(шт)'],
                row: data
            };
        }
    },
    statisticItem: async(parent, { company, dateStart }, {user}) => {
        if(user.role==='admin'){
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateEnd = new Date(dateStart)
                dateEnd.setMonth(dateEnd.getMonth() + 1)
            }

            let statistic = {}
            let data = await InvoiceAzyk.find(
                {
                    $and: [
                        dateStart?{createdAt: {$gte: dateStart}}:{},
                        dateEnd?{createdAt: {$lt: dateEnd}}:{}
                    ],
                    ...{del: {$ne: 'deleted'}}
                }
            )
                .populate({
                    path: 'orders',
                    populate : [
                        {
                            path : 'item',
                            match: company==='all'?{}:{ organization: company },
                            populate : [
                                {
                                    path : 'organization'
                                }
                            ]
                        },
                        {
                            path : 'client',
                            match: { organization: null }
                        }
                    ]
                })
            data = data.filter(data =>data.orders.length>0&&data.orders[0].item&&data.orders[0].client)
            data = data.reduce((acc, val) => acc.concat(val.orders), []);

            for(let i=0; i<data.length; i++) {
                if (data[i].status !== 'обработка'&&!(data[i].client.name.toLowerCase()).includes('агент')&&!(clients[x].name.toLowerCase()).includes('agent')) {
                    if (!statistic[data[i].item._id]) statistic[data[i].item._id] = {
                        profit: 0,
                        cancel: 0,
                        complet: 0,
                        consignmentPrice: 0,
                        item: data[i].item.organization.name+' '+data[i].item.name
                    }
                    if (data[i].status === 'отмена')
                        statistic[data[i].item._id].cancel += 1
                    else {
                        statistic[data[i].item._id].complet += 1
                        statistic[data[i].item._id].profit += (data[i].allPrice - data[i].returned * (data[i].item.stock ? data[i].item.stock : data[i].item.price))
                        if (data[i].consignmentPrice) {
                            console.log(data[i])
                            statistic[data[i].item._id].consignmentPrice += data[i].consignmentPrice
                        }
                    }
                }
            }
            const keys = Object.keys(statistic)
            data = []

            let profitAll = 0
            let consignmentPriceAll = 0
            let completAll = 0
            let cancelAll = 0

            for(let i=0; i<keys.length; i++){
                profitAll += statistic[keys[i]].profit,
                    consignmentPriceAll += statistic[keys[i]].consignmentPrice,
                    completAll += statistic[keys[i]].complet,
                    cancelAll += statistic[keys[i]].cancel,
                    data.push({
                        _id: keys[i],
                        data: [
                            statistic[keys[i]].item,
                            statistic[keys[i]].profit,
                            statistic[keys[i]].consignmentPrice,
                            statistic[keys[i]].complet,
                            statistic[keys[i]].cancel,
                        ]
                    })
            }
            data = data.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            data = [
                {
                    _id: null,
                    data: [
                        data.length,
                        profitAll,
                        consignmentPriceAll,
                        completAll,
                        cancelAll,
                    ]
                },
                ...data
            ]
            return {
                columns: ['товар', 'прибыль(сом)', 'конс(сом)', 'выполнен(шт)', 'отмена(шт)'],
                row: data
            };
        }
    },
    activeItem: async(parent, { organization }, {user}) => {
        if(user.role==='admin'){
            let data = await InvoiceAzyk.find(
                {
                    del: {$ne: 'deleted'},
                }
            )
                    .populate({
                        path: 'orders',
                        match: {
                            $and: [
                                {status: {$ne: 'отмена'}},
                                {status: {$ne: 'обработка'}}
                            ]
                        },
                        populate : [
                            {
                                path : 'item',
                                match: { organization: organization },
                            }
                        ]
                    })
                    .populate(
                        {
                            path : 'client',
                            match: { organization: null }
                        }
                    )
            data = data.filter(data =>data.client&&data.orders.length>0&&data.orders[0].item)
            data = data.reduce((acc, val) => acc.concat(val.orders), []);
            data = data.map(data => data.item);
            data = data.filter((item, idx) =>idx===data.indexOf(item))
            return data;
        }
    },
    activeOrganization: async(parent, ctx, {user}) => {
        if(user.role==='admin'){
            let data = await InvoiceAzyk.find(
                {
                    del: {$ne: 'deleted'},
                }
            )
                .populate({
                    path: 'orders',
                    match: {
                        $and: [
                            {status: {$ne: 'отмена'}},
                            {status: {$ne: 'обработка'}}
                        ]
                    },
                    populate : [
                        {
                            path : 'item',
                            populate : [
                                {
                                    path : 'organization'
                                }
                            ]
                        }
                    ]
                })
                .populate(
                    {
                        path : 'client',
                        match: { organization: null }
                    }
                )
            data = data.filter(data =>data.client&&data.orders.length>0)
            data = data.reduce((acc, val) => acc.concat(val.orders), []);
            data = data.map(data => data.item.organization);
            data = data.filter((organization, idx) =>idx===data.indexOf(organization))
            return data;
        }
    },
    statisticClientGeo: async(parent, { organization, item }, {user}) => {
        if(user.role==='admin'){
            let clients = await ClientAzyk.find({del: {$ne: 'deleted'}, organization: null})
            let address = []
            let good = 0
            let excellent = 0
            let bad = 0
            for(let x=0; x<clients.length;x++) {
                for(let i=0; i<clients[x].address.length;i++){
                    if(clients[x].address[i][1]&&clients[x].address[i][1].length>0&&!(clients[x].name.toLowerCase()).includes('агент')&&!(clients[x].name.toLowerCase()).includes('agent')) {
                        let status
                        let now = new Date()
                        let differenceDates = (now - new Date(clients[x].lastActive)) / (1000 * 60 * 60 * 24)
                        if (!clients[x].lastActive || differenceDates > 5) {
                            status = 'red'
                            bad+=1
                        }
                        else {
                            let invoice
                            if(item){
                                invoice = await InvoiceAzyk.find({client: clients[x]._id, del: {$ne: 'deleted'}})
                                    .populate({
                                        path: 'orders',
                                        match: {
                                            $and: [
                                                {status: {$ne: 'отмена'}},
                                                {status: {$ne: 'обработка'}}
                                            ]
                                        },
                                        populate : {
                                            path : 'item',
                                            match: { _id: item },
                                        }
                                    })
                                    .sort('-createdAt')
                                invoice = invoice.filter(invoice => invoice.orders.length>0&&invoice.orders[0].item)
                                invoice = invoice[0]
                            }
                            else if(organization){
                                invoice = await InvoiceAzyk.find({client: clients[x]._id, del: {$ne: 'deleted'}})
                                    .populate({
                                        path: 'orders',
                                        match: {
                                            $and: [
                                                {status: {$ne: 'отмена'}},
                                                {status: {$ne: 'обработка'}}
                                            ]
                                        },
                                        populate : {
                                            path : 'item',
                                            match: { organization: organization },
                                        }
                                    })
                                    .sort('-createdAt')
                                invoice = invoice.filter(invoice => invoice.orders.length>0&&invoice.orders[0].item)
                                invoice = invoice[0]

                            }
                            else {
                                invoice = await InvoiceAzyk.find({
                                    client: clients[x]._id,
                                    del: {$ne: 'deleted'}
                                })
                                    .populate({
                                        path: 'orders',
                                        match: {
                                            $and: [
                                                {status: {$ne: 'отмена'}},
                                                {status: {$ne: 'обработка'}}
                                            ]
                                        }
                                    })
                                    .sort('-createdAt')
                                invoice = invoice.filter(invoice => invoice.orders.length>0)
                                invoice = invoice[0]
                            }
                            if(invoice) {
                                differenceDates = (now - new Date(invoice.createdAt)) / (1000 * 60 * 60 * 24)
                                if (differenceDates > 5) {
                                    status = 'yellow'
                                    good+=1
                                }
                                else {
                                    status = 'green'
                                    excellent+=1
                                }
                            }
                            else {
                                if(organization||item) {
                                    status = 'red'
                                    bad+=1
                                }
                                else {
                                    status = 'yellow'
                                    good+=1
                                }
                            }
                        }
                        address.push({
                            client: clients[x]._id,
                            address: clients[x].address[i],
                            data: [JSON.stringify(clients[x].notification), status, `${x}${i}`]
                        })
                    }
                }
            }
            address = [
                {
                    client: null,
                    address: null,
                    data: [excellent, good, bad]
                },
                ...address
            ]
            return address
        }
    }
};

module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;