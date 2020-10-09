const ApplicationCantSyt = require('../models/applicationCantSyt');
const UserCantSyt = require('../models/userCantSyt');
const RouteCantSyt = require('../models/routeCantSyt');
const DivisionCantSyt = require('../models/divisionCantSyt');
const CategoryCantSyt = require('../models/categoryCantSyt');
const SettingCantSyt = require('../models/settingCantSyt');
const mongoose = require('mongoose')
const randomstring = require('randomstring');
const { saveFile, urlMain, pdDDMMYYYY } = require('../module/const');
const { pubsub } = require('./index');
const { sendWebPushByRolesIds } = require('../module/webPush');
const RELOAD_DATA = 'RELOAD_DATA';
const ExcelJS = require('exceljs');
const app = require('../app');
const fs = require('fs');
const path = require('path');

const type = `
  type Application {
    _id: ID
    createdAt: Date
    status: String
    number: String
    division: Division
    category: Category
    budget: Boolean
    note: String
    paymentType: String
    comment: String
    official: Boolean
    dateClose: Date
    term: Date
    amount: [Currency]
    specialist: User
    supplier: User
    items: [UsedItems]
    routes: [UsedRoutes]
  }
`;

const query = `
    itemsFromApplications: [[String]]
    applications(search: String!, filter: String!, sort: String!, date: String!, dateEnd: String, supplier: ID, skip: Int!): [Application]
    applicationsForWaybill: [Application]
    application(_id: ID!): Application
    filterApplication: [Filter]
    sortApplication: [Sort]
    unloadingApplication(_id: ID!): Data
`;

const mutation = `
    addApplication(category: ID!, comment: String!, items: [InputItems]!): Data
    setApplication(_id: ID!, comment: String, note: Upload, budget: Boolean, paymentType: String, official: Boolean, supplier: ID, items: [InputItems], routes: [InputRoutes]): Data
    deleteApplication(_id: [ID]!): Data
`;

const resolvers = {
    applicationsForWaybill: async(parent, ctx, {user}) => {
        if(user.role==='снабженец') {
            let res = await ApplicationCantSyt.find({
                status: 'принят',
                supplier: user._id,
            })
                .populate('specialist')
                .populate('supplier')
                .populate('division')
                .populate('category')
                .sort('-createdAt')
                .lean()
            return res
        }
    },
    applications: async(parent, {search, filter, sort, date, skip, dateEnd, supplier}, {user}) => {
        let dateStart;
        if(date!==''&&!supplier){
            dateStart = new Date(date)
            dateStart.setHours(3, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
        }
        else {
            dateStart = new Date(date)
            dateEnd = new Date(dateEnd)
        }
        let users
        let divisions
        let categorys
        if(search.length){
            users = await UserCantSyt.find({name: {'$regex': search, '$options': 'i'}}).distinct('_id').lean()
            divisions = await DivisionCantSyt.find({name: {'$regex': search, '$options': 'i'}}).distinct('_id').lean()
            categorys = await CategoryCantSyt.find({name: {'$regex': search, '$options': 'i'}}).distinct('_id').lean()
        }
        let applications
        if(user.role==='специалист'){
            applications = await ApplicationCantSyt.find({
                specialist: user._id,
                ...filter.length?{status: filter}:{},
                ...search.length?{
                    $or: [
                        {number: {'$regex': search, '$options': 'i'}},
                        {supplier: {$in: users}},
                        {division: {$in: divisions}},
                        {category: {$in: categorys}},
                        {items: {$elemMatch: {name: {'$regex': search, '$options': 'i'}}}},
                    ]
                }:{},
                ...date!==''?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{}
            })
                .populate('specialist')
                .populate('supplier')
                .populate('division')
                .populate('category')
                .sort(sort)
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }
        else if(user.role==='снабженец'){
            applications = await ApplicationCantSyt.find({
                supplier: user._id,
                ...filter.length?{status: filter}:{},
                ...search.length?{
                    $or: [
                        {number: {'$regex': search, '$options': 'i'}},
                        {specialist: {$in: users}},
                        {division: {$in: divisions}},
                        {category: {$in: categorys}},
                        {items: {$elemMatch: {name: {'$regex': search, '$options': 'i'}}}},
                    ]
                }:{},
                ...date!==''?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{}
            })
                .populate('specialist')
                .populate('supplier')
                .populate('division')
                .populate('category')
                .sort(sort)
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }
        else if(['admin', 'менеджер'].includes(user.role)){
            applications = await ApplicationCantSyt.find({
                ...filter.length?{status: filter}:{},
                ...supplier?{supplier: supplier}:{},
                ...search.length?{
                    $or: [
                        {number: {'$regex': search, '$options': 'i'}},
                        {specialist: {$in: users}},
                        ...supplier?[]:[{supplier: {$in: users}}],
                        {division: {$in: divisions}},
                        {category: {$in: categorys}},
                        {items: {$elemMatch: {name: {'$regex': search, '$options': 'i'}}}},
                    ]
                }:{},
                ...date!==''?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{}
            })
                .populate('specialist')
                .populate('supplier')
                .populate('division')
                .populate('category')
                .sort(sort)
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }
        else {
            let divisions = await DivisionCantSyt.find({staffs: user._id}).distinct('_id').lean()
            applications = await ApplicationCantSyt.find({
                ...divisions.length?{division: {$in: divisions}}:{},
                routes: {$elemMatch: {role: user.role}},
                ...filter.length?{status: filter}:{},
                ...search.length?{
                    $or: [
                        {number: {'$regex': search, '$options': 'i'}},
                        {specialist: {$in: users}},
                        {supplier: {$in: users}},
                        {division: {$in: divisions}},
                        {category: {$in: categorys}},
                        {items: {$elemMatch: {name: {'$regex': search, '$options': 'i'}}}},
                    ]
                }:{},
                ...date!==''?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{}
            })
                .populate('specialist')
                .populate('supplier')
                .populate('division')
                .populate('category')
                .sort(sort)
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }

        return applications
    },
    itemsFromApplications: async(parent, ctx, {user}) => {
        if(user.role==='снабженец') {
            let res = []
            let applications = await ApplicationCantSyt.find({
                //status: 'принят',
                supplier: user._id
            }).lean()
            for(let i = 0; i<applications.length; i++){
                for(let i1 = 0; i1<applications[i].items.length; i1++){
                    res.push([applications[i]._id, applications[i].number, applications[i].items[i1].name, `${applications[i].items[i1].count} ${applications[i].items[i1].unit}`])
                }
            }
            return res
        }
    },
    application: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            return await ApplicationCantSyt.findOne({
                _id: _id
            })
                .populate('specialist')
                .populate('supplier')
                .populate({
                    path : 'division',
                    populate: [
                        {
                            path: 'suppliers'
                        }
                    ]
                })
                .populate('category')
                .lean()
        }
        else return null
    },
    filterApplication: async() => {
        let filters = [
            {
                name: 'Все',
                value: ''
            },
            {
                name: 'Обработка',
                value: 'обработка'
            },
            {
                name: 'Принят',
                value: 'принят'
            },
            {
                name: 'Оплачен',
                value: 'оплачен'
            },
            {
                name: 'Выполнен',
                value: 'выполнен'
            },
            {
                name: 'Отмена',
                value: 'отмена'
            }
        ]
        return filters
    },
    sortApplication: async() => {
        let sorts = [
            {
                name: 'Дата создания',
                field: 'createdAt'
            },
            {
                name: 'Срок',
                field: 'term'
            },
            {
                name: 'Дата закрытия',
                field: 'dateClose'
            },
        ]
        return sorts
    },
    unloadingApplication: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            let application =  await ApplicationCantSyt.findOne({
                _id: _id
            })
                .populate('specialist')
                .populate('supplier')
                .populate({
                    path : 'division',
                    populate: [
                        {
                            path: 'suppliers'
                        }
                    ]
                })
                .populate('category')
                .lean()
            let workbook = new ExcelJS.Workbook();
            let worksheet;
            worksheet = await workbook.addWorksheet(`Заявка на закуп №${application.number}`);
            worksheet.getColumn(1).width = 5;
            worksheet.getColumn(2).width = 30;
            worksheet.getColumn(3).width = 10;
            worksheet.getColumn(4).width = 10;
            worksheet.getColumn(5).width = 10;
            worksheet.getColumn(6).width = 30;
            worksheet.getColumn(7).width = 15;
            let row = 1;
            worksheet.getCell(`C${row}`).font = {bold: true};
            worksheet.getCell(`C${row}`).value = `Ссылка: ${process.env.URL.trim()}/application/${application._id}`;
            row += 1;
            worksheet.getCell(`C${row}`).font = {bold: true};
            worksheet.getCell(`C${row}`).value = `Заявка на закуп №${application.number}`;
            row += 2;
            worksheet.getCell(`A${row}`).value = `Подразделение: ${application.division.name}`;
            worksheet.getCell(`D${row}`).value = `Специалист: ${application.specialist.name}`;
            row += 1;
            worksheet.getCell(`A${row}`).value = `Дата: ${pdDDMMYYYY(application.createdAt)}`;
            if(application.term) {
                worksheet.getCell(`D${row}`).value = `Срок: ${pdDDMMYYYY(application.term)}`;
            }
            if(application.comment&&application.comment.length) {
                row += 1;
                worksheet.getCell(`A${row}`).value = `Обоснование: ${application.comment}`;
            }
            row += 2;
            worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`A${row}`).value = '№';
            worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`B${row}`).value = 'ТМЦ';
            worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`C${row}`).value = 'Кол-во';
            worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`D${row}`).value = 'Цена';
            worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`E${row}`).value = 'Сумма';
            worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`F${row}`).value = 'Коментарий';
            row += 1;
            for(let i = 0; i<application.items.length; i++){
                worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`A${row}`).value = i+1;
                worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`B${row}`).alignment = { wrapText: true };
                worksheet.getCell(`B${row}`).value = application.items[i].name;
                worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`C${row}`).value = `${application.items[i].count} ${application.items[i].unit}`;
                worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`D${row}`).value = `${application.items[i].price} ${application.items[i].currency}`;
                worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).value = `${application.items[i].count*application.items[i].price} ${application.items[i].currency}`;
                worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`F${row}`).alignment = { wrapText: true };
                worksheet.getCell(`F${row}`).value = application.items[i].comment;
                row += 1;
            }
            row += 1;
            for(let i = 0; i<application.routes.length; i++){
                worksheet.getCell(`A${row}`).value = `${application.routes[i].role}: ${application.routes[i].confirmation?`принят ${pdDDMMYYYY(application.routes[i].confirmation)}`:application.routes[i].cancel?`отмена ${pdDDMMYYYY(application.routes[i].cancel)}`:'обработка'}`;
                row += 1;
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
        else return null
    },
};

const resolversMutation = {
    addApplication: async(parent, {category, items, comment}, {user}) => {
        if('специалист'===user.role) {
            let division = await DivisionCantSyt.findOne({specialists: user._id}).lean()
            category = await CategoryCantSyt.findById(category).lean()
            if(division){
                let setting = await SettingCantSyt.findOne().lean()
                let supplier
                if(setting.supplier==='подразделение')
                    supplier = division.suppliers[0]
                else
                    supplier = category.suppliers[0]
                if(supplier) {
                    let number = randomstring.generate({length: 5, charset: 'numeric'});
                    while (await ApplicationCantSyt.findOne({number: number}).lean())
                        number = randomstring.generate({length: 5, charset: 'numeric'});
                    let amount1 = {}, amount = []
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].status !== 'отмена') {
                            if (!amount1[items[i].currency])
                                amount1[items[i].currency] = 0
                            amount1[items[i].currency] += items[i].count * items[i].price
                        }
                    }
                    const keys = Object.keys(amount1)
                    for (let i = 0; i < keys.length; i++) {
                        amount.push({name: keys[i], value: amount1[keys[i]]})
                    }
                    let roles = (await RouteCantSyt.findOne().lean()).roles
                    let route = []
                    for (let i = 0; i < roles.length; i++) {
                        route.push({role: roles[i], confirmation: undefined, cancel: undefined, comment: ''})
                    }
                    let newApplication = new ApplicationCantSyt({
                        status: 'обработка',
                        number: number,
                        division: division._id,
                        category: category._id,
                        amount: amount,
                        specialist: user._id,
                        supplier: supplier,
                        items: items,
                        routes: route,
                        budget: true,
                        paymentType:  'наличные',
                        official: true,
                        comment: comment
                    });
                    newApplication = await ApplicationCantSyt.create(newApplication);
                    pubsub.publish(RELOAD_DATA, {
                        reloadData: {
                            type: 'ADD',
                            who: user._id,
                            ids: [newApplication.supplier],
                            roles: [...roles, 'admin', 'менеджер'],
                            application: await ApplicationCantSyt.findById(newApplication._id)
                                .populate('specialist')
                                .populate('supplier')
                                .populate({
                                    path: 'division',
                                    populate: [
                                        {
                                            path: 'suppliers'
                                        }
                                    ]
                                })
                                .populate('category')
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
                        roles: [roles[0], 'admin', 'менеджер'],
                        _ids: []
                    })
                }
            }
            return {data: 'OK'}
        }
    },
    setApplication: async(parent, {_id, budget, note, paymentType, comment, official, supplier, items, routes}, {user}) => {
        let object = await ApplicationCantSyt.findById(_id).populate('category')
        if(['специалист', 'снабженец', 'admin', 'менеджер', ...object.routes.map(route=>route.role)].includes(user.role)){
            if(supplier){
                object.supplier = supplier
            }
            if(note){
                let { stream, filename } = await note;
                filename = await saveFile(stream, filename)
                object.note = urlMain+filename
            }
            let amount1 = {}, amount = []
            for(let i = 0; i<items.length; i++){
                if(items[i].status!=='отмена') {
                    if (!amount1[items[i].currency])
                        amount1[items[i].currency] = 0
                    amount1[items[i].currency]+=items[i].count*items[i].price
                }
            }
            const keys = Object.keys(amount1)
            for(let i = 0; i<keys.length; i++){
                amount.push({name: keys[i], value: amount1[keys[i]]})
            }
            if(budget!==undefined)
                object.budget = budget
            if(paymentType!==undefined)
                object.paymentType = paymentType
            if(official!==undefined)
                object.official = official
            if(comment)
                object.comment = comment
            object.items = items
            object.amount = amount
            if(JSON.stringify(object.routes)===JSON.stringify(routes)){
                let index = undefined
                for (let i = 0; i < routes.length; i++) {
                    if (index===undefined&&(!routes[i].confirmation||routes[i].cancel)) {
                        index = i
                    }
                }
                await sendWebPushByRolesIds({
                    title: 'Заявка изменена',
                    message: `Заявка №${object.number} изменена`,
                    url: `${process.env.URL.trim()}/application/${object._id}`,
                    roles: ['admin', 'менеджер', routes[index].role],
                    _ids: []
                })
            }
            else {
                object.routes = routes
                if (!['оплачен', 'выполнен'].includes(object.status)) {
                    let status = 'обработка'
                    for (let i = 0; i < routes.length; i++) {
                        let cancel = routes[i].cancel&&routes[i].cancel.toString()!==new Date(0).toString()
                        let confirmation = routes[i].confirmation&&routes[i].confirmation.toString()!==new Date(0).toString()
                        if (cancel) {
                            status = 'отмена'
                        }
                        else if (confirmation && status !== 'отмена') {
                            status = 'принят'
                        }
                        else if (!confirmation && status !== 'отмена') {
                            status = 'обработка'
                        }
                    }
                    object.status = status
                }
                if (object.status === 'принят') {

                    let term = new Date()
                    term.setDate(term.getDate() + object.category.term)
                    object.term = term

                    await sendWebPushByRolesIds({
                        title: 'Заявка принята',
                        message: `Заявка №${object.number} принята`,
                        url: `${process.env.URL.trim()}/application/${object._id}`,
                        roles: ['admin', 'менеджер', 'бухгалтерия', 'кассир'],
                        _ids: []
                    })
                }
                else if (object.status === 'обработка') {
                    let index = 0
                    for (let i = 0; i < routes.length; i++) {
                        if (index===undefined&&!routes[i].confirmation) {
                            index = i
                        }
                    }
                    await sendWebPushByRolesIds({
                        title: 'Заявка изменена',
                        message: `Заявка №${object.number} изменена`,
                        url: `${process.env.URL.trim()}/application/${object._id}`,
                        roles: ['admin', 'менеджер', routes[index].role],
                        _ids: []
                    })
                }
                else if (object.status === 'отмена') {
                    await sendWebPushByRolesIds({
                        title: 'Заявка отменена',
                        message: `Заявка №${object.number} отменена`,
                        url: `${process.env.URL.trim()}/application/${object._id}`,
                        roles: ['admin', 'менеджер'],
                        _ids: [object.specialist]
                    })
                }
            }
            await object.save();
            pubsub.publish(RELOAD_DATA, { reloadData: {
                type: 'SET',
                who: user._id,
                ids: [object.supplier, object.specialist],
                roles: [...object.routes.map(route=>route.role), 'admin', 'менеджер'],
                application: await ApplicationCantSyt.findOne({
                    _id: object._id
                })
                    .populate('specialist')
                    .populate('supplier')
                    .populate({
                        path : 'division',
                        populate: [
                            {
                                path: 'suppliers'
                            }
                        ]
                    })
                    .populate('category')
                    .lean(),
                cashConsumable: undefined,
                waybill: undefined,
                expenseReport: undefined,
                balance: undefined,
            } });
        }
        return {data: 'OK'}
    },
    deleteApplication: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер', 'специалист', 'снабженец'].includes(user.role)) {
            for(let i = 0; i<_id.length; i++) {
                let application = await ApplicationCantSyt.findById(_id[i]).lean()
                pubsub.publish(RELOAD_DATA, { reloadData: {
                    type: 'DELETE',
                    who: user._id,
                    ids: [application.supplier, application.specialist],
                    roles: [...application.routes.map(route=>route.role), 'admin', 'менеджер'],
                    application: {
                        _id: _id[i]
                    },
                    cashConsumable: undefined,
                    waybill: undefined,
                    expenseReport: undefined,
                    balance: undefined,
                } });
                await ApplicationCantSyt.deleteMany({_id: _id[i]})
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