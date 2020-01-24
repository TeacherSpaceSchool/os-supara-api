const InvoiceAzyk = require('../models/invoiceAzyk');
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
    statisticClientGeo: [GeoStatistic]
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
                            path : 'client'
                        }
                    ]
                })
            data = data.filter(data =>data.orders.length>0&&data.orders[0].item)
            data = data.reduce((acc, val) => acc.concat(val.orders), []);

            for(let i=0; i<data.length; i++){
                    if(!statistic[data[i].client._id]) statistic[data[i].client._id]={profit: 0, cancel: 0, complet: 0, consignmentPrice: 0, client: data[i].client.name}
                    if(data.status==='отмена')
                        statistic[data[i].client._id].cancel+=1
                    else if(data.status!=='обработка'){
                        statistic[data[i].client._id].complet+=1
                        statistic[data[i].client._id].profit+=(data[i].allPrice-data[i].returned*(data[i].item.stock?data[i].item.stock:data[i].item.price))
                        if(data[i].consignmentPrice&&!data[i].paymentConsignation){
                            statistic[data[i].client._id].consignmentPrice+=data[i].consignmentPrice
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
                        `Всего: ${data.length}`,
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
    statisticClientGeo: async(parent, ctx, {user}) => {
        if(user.role==='admin'){
            let clients = await ClientAzyk.find({del: {$ne: 'deleted'}, organization: null})
            let address = []
            for(let x=0; x<clients.length;x++) {
                for(let i=0; i<clients[x].address.length;i++){
                    if(clients[x].address[i][1]&&clients[x].address[i][1].length>0) {
                        let status
                        let now = new Date()
                        let differenceDates = (now - new Date(clients[x].lastActive)) / (1000 * 60 * 60 * 24)
                        if (!clients[x].lastActive || differenceDates > 5)
                            status = 'red'
                        else {
                            let invoice = await InvoiceAzyk.findOne({client: clients[x]._id, del: {$ne: 'deleted'}, status: {$ne: 'отмена'}}).sort('-createdAt')
                            if(invoice) {
                                differenceDates = (now - new Date(invoice.createdAt)) / (1000 * 60 * 60 * 24)
                                if (differenceDates > 5)
                                    status = 'yellow'
                                else
                                    status = 'green'
                            }
                            else
                                status = 'yellow'
                        }
                        address.push({
                            client: clients[x]._id,
                            address: clients[x].address[i],
                            data: [JSON.stringify(clients[x].notification), status, `${x}${i}`]
                        })
                    }
                }
            }
            return address
        }
    }
};

module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;