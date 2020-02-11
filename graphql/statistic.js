const InvoiceAzyk = require('../models/invoiceAzyk');
const ClientAzyk = require('../models/clientAzyk');
const ExcelJS = require('exceljs');
const randomstring = require('randomstring');
const app = require('../app');
const fs = require('fs');
const path = require('path');
const { urlMain } = require('../module/const');

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
    unloadingOrders(organization: ID!, dateStart: Date!): Data
    statisticClient(company: String, dateStart: Date, dateType: String): Statistic
    statisticItem(company: String, dateStart: Date, dateType: String): Statistic
    activeItem(organization: ID!): [Item]
    activeOrganization: [Organization]
    statisticClientGeo(organization: ID, item: ID): [GeoStatistic]
`;

const resolvers = {
    statisticClient: async(parent, { company, dateStart, dateType }, {user}) => {
        if(user.role==='admin'){
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateEnd = new Date(dateStart)
                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
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
            data = data.filter(data =>data.orders.length>0&&data.orders[0].item&&data.orders[0].client&&data.orders[0].status !== 'обработка')
            for(let i=0; i<data.length; i++) {
                for(let ii=0; ii<data[i].orders.length; ii++) {
                    data[i].orders[ii].invoice = data[i]._id
                }
            }
            data = data.reduce((acc, val) => acc.concat(val.orders), []);


            for(let i=0; i<data.length; i++) {
                if (data[i].status !== 'обработка'&&!(data[i].client.name.toLowerCase()).includes('агент')&&!(data[i].client.name.toLowerCase()).includes('agent')) {
                    if (!statistic[data[i].client._id])
                        statistic[data[i].client._id] = {
                            profit: 0,
                            cancel: [],
                            complet: [],
                            consignmentPrice: 0,
                            client: data[i].client.name
                        }
                    if (data[i].status === 'отмена') {
                        if(!statistic[data[i].client._id].cancel.includes(data[i].invoice)) {
                            statistic[data[i].client._id].cancel.push(data[i].invoice)
                        }
                    } else {
                        if(!statistic[data[i].client._id].complet.includes(data[i].invoice)) {
                            statistic[data[i].client._id].complet.push(data[i].invoice)
                        }
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
                profitAll += statistic[keys[i]].profit
                consignmentPriceAll += statistic[keys[i]].consignmentPrice
                completAll += statistic[keys[i]].complet.length
                cancelAll += statistic[keys[i]].cancel.length
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].client,
                        statistic[keys[i]].profit,
                        statistic[keys[i]].consignmentPrice,
                        statistic[keys[i]].complet.length,
                        statistic[keys[i]].cancel.length,
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
    statisticItem: async(parent, { company, dateStart, dateType }, {user}) => {
        if(user.role==='admin'){
            let dateEnd
            if(dateStart){
                dateStart= new Date(dateStart)
                dateEnd = new Date(dateStart)

                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
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
            for(let i=0; i<data.length; i++) {
                for(let ii=0; ii<data[i].orders.length; ii++) {
                    data[i].orders[ii].invoice = data[i]._id
                }
            }
            data = data.reduce((acc, val) => acc.concat(val.orders), []);

            for(let i=0; i<data.length; i++) {
                if (data[i].status !== 'обработка'&&!(data[i].client.name.toLowerCase()).includes('агент')&&!(data[i].client.name.toLowerCase()).includes('agent')) {
                    if (!statistic[data[i].item._id]) statistic[data[i].item._id] = {
                        profit: 0,
                        cancel: [],
                        complet: [],
                        consignmentPrice: 0,
                        item: data[i].item.organization.name+' '+data[i].item.name
                    }
                    if (data[i].status === 'отмена') {
                        if (!statistic[data[i].item._id].cancel.includes(data[i].invoice)) {
                            statistic[data[i].item._id].cancel.push(data[i].invoice)
                        }
                    }
                    else {
                        if(!statistic[data[i].item._id].complet.includes(data[i].invoice)) {
                            statistic[data[i].item._id].complet.push(data[i].invoice)
                        }
                        statistic[data[i].item._id].profit += (data[i].allPrice - data[i].returned * (data[i].item.stock ? data[i].item.stock : data[i].item.price))
                        if (data[i].consignmentPrice) {
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
                profitAll += statistic[keys[i]].profit
                consignmentPriceAll += statistic[keys[i]].consignmentPrice
                completAll += statistic[keys[i]].complet.length
                cancelAll += statistic[keys[i]].cancel.length
                data.push({
                    _id: keys[i],
                    data: [
                        statistic[keys[i]].item,
                        statistic[keys[i]].profit,
                        statistic[keys[i]].consignmentPrice,
                        statistic[keys[i]].complet.length,
                        statistic[keys[i]].cancel.length,
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
                        if ((!clients[x].lastActive || differenceDates > 7)&&!item&&!organization) {
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
                                if (differenceDates > 7) {
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
    },
    unloadingOrders: async(parent, { organization, dateStart }, {user}) => {
        if(user.role==='admin'){
            let workbook = new ExcelJS.Workbook();
            let dateEnd
            if(dateStart){
                dateStart = new Date(dateStart)
                dateStart = dateStart.setHours(3)
                dateEnd = new Date(dateStart)
                dateEnd = dateEnd.setDate(dateEnd.getDate() + 1)
            }
            let data = await InvoiceAzyk.find(
                {
                    $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
                    ...{del: {$ne: 'deleted'}}
                }
            )
                .populate({
                    path: 'orders',
                    match: { status: 'принят' },
                    populate : [
                        {
                            path : 'item',
                            match: { organization: organization }
                        }
                    ]
                })
                .populate({
                   path : 'client'
                })
            data = data.filter(data =>{
                return(data.orders.length>0&&data.orders[0].item)
            })
            let worksheet;
            let orders = {};
            for(let i = 0; i<data.length;i++){
                let allPrice = 0
                let consignmentPrice = 0
                if(!orders[data[i].client._id]) {
                    orders[data[i].client._id]= {
                        client: data[i].client,
                        address: `${data[i].address[2] ? `${data[i].address[2]}, ` : ''}${data[i].address[0]}`,
                        orders: {},
                        allPrice: 0,
                        consignmentPrice: 0
                    }
                }
                for(let i1 = 0; i1<data[i].orders.length; i1++) {
                    if(!orders[data[i].client._id].orders[data[i].orders[i1].item._id]) {
                        orders[data[i].client._id].orders[data[i].orders[i1].item._id] = {
                            allPrice: 0,
                            consignmentPrice: 0,
                            count: 0,
                            name: data[i].orders[i1].item.name
                        }
                    }
                    orders[data[i].client._id].orders[data[i].orders[i1].item._id].allPrice += data[i].orders[i1].allPrice
                    orders[data[i].client._id].orders[data[i].orders[i1].item._id].count += data[i].orders[i1].count
                    orders[data[i].client._id].orders[data[i].orders[i1].item._id].consignmentPrice += data[i].orders[i1].consignmentPrice
                    allPrice += data[i].orders[i1].allPrice
                    consignmentPrice += data[i].orders[i1].consignmentPrice
                }
                orders[data[i].client._id].allPrice = allPrice
                orders[data[i].client._id].consignmentPrice = consignmentPrice
            }
            const keys = Object.keys(orders)
            for(let i = 0; i<keys.length;i++){
                worksheet = await workbook.addWorksheet(`Заказ${i+1}`);
                let row = 1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Клиент:';
                worksheet.getCell(`B${row}`).value = orders[keys[i]].client.name;
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Адрес:';
                worksheet.getCell(`B${row}`).value = orders[keys[i]].address;
                for(let i1=0; i1<orders[keys[i]].client.phone.length; i1++) {
                    row+=1;
                    if(!i1) {
                        worksheet.getCell(`A${row}`).font = {bold: true};
                        worksheet.getCell(`A${row}`).value = 'Телефон:';
                    }
                    worksheet.getCell(`B${row}`).value = orders[keys[i]].client.phone[i1];
                }
                row+=1;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Сумма:';
                worksheet.getCell(`B${row}`).value = `${orders[keys[i]].allPrice} сом`;
                if(orders[keys[i]].consignmentPrice>0) {
                    row+=1;
                    worksheet.getCell(`A${row}`).font = {bold: true};
                    worksheet.getCell(`A${row}`).value = 'Консигнации:';
                    worksheet.getCell(`B${row}`).value = `${orders[keys[i]].consignmentPrice} сом`;
                }
                row+=2;
                worksheet.getCell(`A${row}`).font = {bold: true};
                worksheet.getCell(`A${row}`).value = 'Товары:';
                worksheet.getCell(`B${row}`).font = {bold: true};
                worksheet.getCell(`B${row}`).value = 'Количество:';
                worksheet.getCell(`C${row}`).font = {bold: true};
                worksheet.getCell(`C${row}`).value = 'Сумма:';
                if(orders[keys[i]].consignmentPrice>0) {
                    worksheet.getCell(`D${row}`).font = {bold: true};
                    worksheet.getCell(`D${row}`).value = 'Консигнации:';
                }
                const keys1 = Object.keys(orders[keys[i]].orders)
                for(let i1=0; i1<keys1.length; i1++) {
                    worksheet.addRow([
                        orders[keys[i]].orders[keys1[i1]].name,
                        `${orders[keys[i]].orders[keys1[i1]].count} шт`,
                        `${orders[keys[i]].orders[keys1[i1]].allPrice} сом`,
                        orders[keys[i]].orders[keys1[i1]].consignmentPrice>0?`${orders[keys[i]].orders[keys1[i1]].consignmentPrice} сом`:''
                    ]);
                }
            }
            let xlsxname = `${randomstring.generate(20)}.xlsx`;
            let xlsxdir = path.join(app.dirname, 'public', 'xlsx');
            if (!await fs.existsSync(xlsxdir)){
                await fs.mkdirSync(xlsxdir);
            }
            let xlsxpath = path.join(app.dirname, 'public', 'xlsx', xlsxname);
            await workbook.xlsx.writeFile(xlsxpath);
            return({data: urlMain + '/xlsx/' + xlsxname})
        }
    },
};

module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;