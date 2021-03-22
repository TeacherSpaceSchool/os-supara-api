const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const cron = require('node-cron');
const AutoApplicationOsSupara = require('../models/autoApplication');
const ApplicationOsSupara = require('../models/application');
const StorageOsSupara = require('../models/storage');
const CategoryOsSupara = require('../models/category');
const {checkFloat, weekDay} = require('../module/const');
const { pubsub } = require('../graphql/index');
const { sendWebPushByRolesIds } = require('../module/webPush');
const RELOAD_DATA = 'RELOAD_DATA';
const randomstring = require('randomstring');

connectDB.connect();
if(!isMainThread) {
    cron.schedule('1 6 * * *', async() => {
        let autoApplicationOsSupara = await AutoApplicationOsSupara.find({}).lean()
        let category = await CategoryOsSupara.findOne({name: 'Автозакуп'}).select('_id').lean()
        let items, storage, buy
        for(let i=0; i<autoApplicationOsSupara.length; i++) {
            if(autoApplicationOsSupara[i].supplier&&autoApplicationOsSupara[i].division) {
                items = []
                for (let i1 = 0; i1 < autoApplicationOsSupara[i].items.length; i1++) {
                    buy = false
                    if(autoApplicationOsSupara[i].items[i1].type==='Количество') {
                        storage = await StorageOsSupara.findOne({item: autoApplicationOsSupara[i].items[i1].item}).select('count').lean()
                        buy = storage&&storage.count<=autoApplicationOsSupara[i].items[i1].triggerCount
                    } else {
                        buy = autoApplicationOsSupara[i].items[i1].triggerDays.includes(weekDay[(new Date()).getDay()])
                    }
                    if (buy&&autoApplicationOsSupara[i].items[i1].item) {
                        items.push({
                            name: autoApplicationOsSupara[i].items[i1].name,
                            unit: autoApplicationOsSupara[i].items[i1].unit,
                            currency: 'сом',
                            price: 0,
                            count: autoApplicationOsSupara[i].items[i1].count,
                            comment: '',
                            GUID: autoApplicationOsSupara[i].items[i1].GUID,
                            status: 'принят'
                        })
                    }
                }
                let number = randomstring.generate({length: 6, charset: 'numeric'});
                while (await ApplicationOsSupara.findOne({number: number}).select('_id').lean())
                    number = randomstring.generate({length: 6, charset: 'numeric'});
                let amount1 = {}, amount = []
                for (let i1 = 0; i1 < items.length; i1++) {
                    if (items[i1].status !== 'отмена') {
                        if (!amount1[items[i1].currency])
                            amount1[items[i1].currency] = 0
                        amount1[items[i1].currency] += items[i1].count * items[i1].price
                    }
                }
                const keys = Object.keys(amount1)
                for (let i1 = 0; i1 < keys.length; i1++) {
                    amount.push({name: keys[i1], value: checkFloat(amount1[keys[i1]])})
                }
                let routes = []
                for (let i1 = 0; i1 < autoApplicationOsSupara[i].roles.length; i1++) {
                    routes.push({
                        role: autoApplicationOsSupara[i].roles[i1],
                        confirmation: undefined,
                        cancel: undefined,
                        comment: ''
                    })
                }
                let term = new Date()
                term.setDate(term.getDate() + 1)
                let object = {
                    status: 'обработка',
                    number,
                    division: autoApplicationOsSupara[i].division,
                    category: category._id,
                    amount,
                    specialist: autoApplicationOsSupara[i].specialist,
                    supplier: autoApplicationOsSupara[i].supplier,
                    items,
                    routes,
                    budget: true,
                    paymentType: 'наличные',
                    official: true,
                    comment: 'Aвтозакуп',
                    term
                }
                let newApplication = new ApplicationOsSupara(object);
                newApplication = await ApplicationOsSupara.create(newApplication);
                pubsub.publish(RELOAD_DATA, {
                    reloadData: {
                        type: 'ADD',
                        who: undefined,
                        ids: [newApplication.supplier],
                        roles: [...autoApplicationOsSupara[i].roles, 'admin', 'менеджер'],
                        application: await ApplicationOsSupara.findById(newApplication._id)
                            .select('term _id number status createdAt dateClose category division supplier specialist amount routes')
                            .populate({
                                path: 'specialist',
                                select: 'name _id'
                            })
                            .populate({
                                path: 'supplier',
                                select: 'name _id'
                            })
                            .populate({
                                path: 'division',
                                select: 'name _id'
                            })
                            .populate({
                                path: 'category',
                                select: 'name _id'
                            })
                            .lean(),
                        cashConsumable: undefined,
                        waybill: undefined,
                        expenseReport: undefined,
                        balance: undefined,
                    }
                });
                await sendWebPushByRolesIds({
                    title: 'Заявка добавлена',
                    message: `Заявка №${newApplication.number} добавлена`,
                    url: `${process.env.URL.trim()}/application/${newApplication._id}`,
                    roles: [...autoApplicationOsSupara[i].roles, 'admin', 'менеджер'],
                    _ids: []
                })
            }
        }
    });
}