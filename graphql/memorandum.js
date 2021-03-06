const MemorandumOsSupara = require('../models/memorandum');
const UserOsSupara = require('../models/user');
const randomstring = require('randomstring');
const { pdDDMMYYYY, urlMain } = require('../module/const');
const { pubsub } = require('./index');
const { sendWebPushByRolesIds } = require('../module/webPush');
const RELOAD_DATA = 'RELOAD_DATA';
const ExcelJS = require('exceljs');
const app = require('../app');
const fs = require('fs');
const path = require('path');

const type = `
  type Memorandum {
    _id: ID
    createdAt: Date
    status: String
    number: String
    name: String
    comment: String
    note: [String]
    term: Date
    who: User
    whom: User
    notifiables: [User]
    routes: [UsedRoutes]
    approve: Boolean
    completed: Boolean
    checked: Boolean
    dateClose: Date
  }
`;

const query = `
    memorandums(search: String!, filter: String!, sort: String!, date: String!, skip: Int!): [Memorandum]
    memorandum(_id: ID!): Memorandum
    unloadingMemorandum(_id: ID!): Data
`;

const mutation = `
    addMemorandum(name: String!, comment: String!, note: [String], term: Date!, whom: ID!, notifiables: [ID]!, routes: [ID]!): Data
    setMemorandum(_id: ID!, name: String, comment: String, note: [String], term: Date, routes: [InputRoutes]!, completed: Boolean, checked: Boolean): Data
    deleteMemorandum(_id: [ID]!): Data
`;

const resolvers = {
    memorandums: async(parent, {search, filter, sort, date, skip}, {user}) => {
        let memorandums = []
        if(user.checkedPinCode) {
            let dateStart, dateEnd;
            if (date !== '') {
                dateStart = new Date(date)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            let users
            if (search.length)
                users = await UserOsSupara.find({name: {'$regex': search, '$options': 'i'}}).distinct('_id').lean()
            memorandums = await MemorandumOsSupara.find({
                ...search.length||!['admin', '????????????????'].includes(user.role)?{
                    $or: [
                        ...search.length ? [
                            {number: {'$regex': search, '$options': 'i'}},
                            {who: {$in: users}},
                            {whom: {$in: users}},
                        ]:[],
                        ...!['admin', '????????????????'].includes(user.role)?[
                            {who: user._id},
                            {whom: user._id},
                            {notifiables: user._id}
                        ]:[],
                    ]
                }:{},
                ...filter.length ? {status: filter} : {},
                ...date !== '' ? {$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]} : {}
            })
                .populate({
                    path: 'who',
                    select: 'name _id'
                })
                .populate({
                    path: 'whom',
                    select: 'name _id'
                })
                .populate({
                    path: 'notifiables',
                    select: 'name _id'
                })
                .sort(sort)
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 15 : 10000000000)
                .lean()
        }
        return memorandums
    },
    memorandum: async(parent, {_id}, {user}) => {
        if(user.checkedPinCode) {
            return await MemorandumOsSupara.findOne({
                _id: _id
            })
                .populate({
                    path: 'who',
                    select: 'name _id'
                })
                .populate({
                    path: 'whom',
                    select: 'name _id'
                })
                .populate({
                    path: 'notifiables',
                    select: 'name _id'
                })
                .lean()
        }
    },
    unloadingMemorandum: async(parent, {_id}, {user}) => {
        if(user.checkedPinCode) {
            let memorandum =  await MemorandumOsSupara.findOne({
                _id: _id
            })
                .populate({
                    path: 'who',
                    select: 'name _id'
                })
                .populate({
                    path: 'whom',
                    select: 'name _id'
                })
                .populate({
                    path: 'notifiables',
                    select: 'name _id'
                })
                .lean()
            const usersName = {}
            for(let i=0; i<memorandum.notifiables.length; i++){
                usersName[memorandum.notifiables[i]._id] = memorandum.notifiables[i].name
            }
            usersName[memorandum.whom._id] = memorandum.whom.name
            let workbook = new ExcelJS.Workbook();
            let worksheet;
            worksheet = await workbook.addWorksheet(`?????????????????? ?????????????? ???${memorandum.number}`);
            worksheet.getColumn(1).width = 5;
            worksheet.getColumn(2).width = 30;
            worksheet.getColumn(3).width = 10;
            worksheet.getColumn(4).width = 10;
            worksheet.getColumn(5).width = 10;
            worksheet.getColumn(6).width = 30;
            worksheet.getColumn(7).width = 15;
            let row = 1;
            worksheet.getCell(`A${row}`).font = {bold: true};
            worksheet.getCell(`A${row}`).value = `${process.env.URL.trim()}/memorandum/${memorandum._id}`;
            row += 1;
            worksheet.getCell(`C${row}`).font = {bold: true};
            worksheet.getCell(`C${row}`).value = `?????????????????? ?????????????? ???${memorandum.number}`;
            row += 2;
            worksheet.getCell(`A${row}`).value = `??????: ${memorandum.who.name}`;
            row += 1;
            worksheet.getCell(`A${row}`).value = `????????: ${memorandum.whom.name}`;
            row += 1;
            worksheet.getCell(`A${row}`).value = `????????: ${pdDDMMYYYY(memorandum.createdAt)}`;
            if(memorandum.term) {
                worksheet.getCell(`D${row}`).value = `????????: ${pdDDMMYYYY(memorandum.term)}`;
            }
            row += 1;
            worksheet.getCell(`A${row}`).value = `??????????????????: ${memorandum.name}`;
            row += 1;
            worksheet.getCell(`A${row}`).value = `??????????: ${memorandum.comment}`;
            row += 1;
            for(let i = 0; i<memorandum.routes.length; i++){
                worksheet.getCell(`A${row}`).value = `${usersName[memorandum.routes[i].user._id]}: ${memorandum.routes[i].confirmation?`???????????? ${pdDDMMYYYY(memorandum.routes[i].confirmation)}`:memorandum.routes[i].cancel?`???????????? ${pdDDMMYYYY(memorandum.routes[i].cancel)}`:'??????????????????'}`;
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
    },
};

const resolversMutation = {
    addMemorandum: async(parent, {name, comment, note, term, whom, notifiables, routes}, {user}) => {
        if(user.checkedPinCode) {
            let number = randomstring.generate({length: 6, charset: 'numeric'});
            while (await MemorandumOsSupara.findOne({number: number}).select('_id').lean())
                number = randomstring.generate({length: 6, charset: 'numeric'});
            let _routes = []
            for (let i = 0; i < routes.length; i++) {
                _routes.push({user: routes[i], confirmation: undefined, cancel: undefined, comment: ''})
            }
            _routes.push({user: whom, confirmation: undefined, cancel: undefined, comment: ''})
            let object = {
                 status: '??????????????????',
                 number,
                 name,
                 comment,
                 note,
                 term,
                 who: user._id,
                 whom,
                 notifiables,
                 routes: _routes
            }
             let newMemorandum = new MemorandumOsSupara(object);
             newMemorandum = await MemorandumOsSupara.create(newMemorandum);
            pubsub.publish(RELOAD_DATA, {
                 reloadData: {
                     type: 'ADD',
                     who: user._id,
                     ids: [newMemorandum.whom, ...notifiables],
                     roles: ['admin', '????????????????'],
                     memorandum: await MemorandumOsSupara.findById(newMemorandum._id)
                         .populate({
                             path: 'who',
                             select: 'name _id'
                         })
                         .populate({
                             path: 'whom',
                             select: 'name _id'
                         })
                         .populate({
                             path: 'notifiables',
                             select: 'name _id'
                         })
                         .populate({
                             path: 'routes',
                             populate: {
                                 path: 'user',
                                 select: 'name _id'
                             }
                         })
                         .lean()
                 }
             });
             await sendWebPushByRolesIds({
                 title: '?????????????????? ?????????????? ??????????????????',
                 message: `?????????????????? ?????????????? ???${newMemorandum.number} ??????????????????`,
                 url: `${process.env.URL.trim()}/memorandum/${newMemorandum._id}`,
                 roles: ['admin', '????????????????'],
                 _ids: [newMemorandum.whom, ...notifiables]
             })
            return {data: 'OK'}
        }
    },
    setMemorandum: async(parent, {_id, name, comment, note, term, routes, completed, checked}, {user}) => {
        if(user.checkedPinCode) {
            let object = await MemorandumOsSupara.findById(_id)
            if (name) object.name = name
            if (note) object.note = note
            if (comment) object.comment = comment
            if (term) object.term = term
            if (completed&&object.status==='????????????') {
                object.completed = completed
                object.status = '????????????????'
                await sendWebPushByRolesIds({
                    title: '?????????????????? ?????????????? ??????????????????',
                    message: `?????????????????? ?????????????? ???${object.number} ??????????????????`,
                    url: `${process.env.URL.trim()}/memorandum/${object._id}`,
                    roles: ['admin', '????????????????'],
                    _ids: [object.who, ...object.notifiables]
                })
            }
            if (checked&&object.status==='????????????????') {
                object.checked = checked
                object.status = '????????????????'
                await sendWebPushByRolesIds({
                    title: '?????????????????? ?????????????? ??????????????????',
                    message: `?????????????????? ?????????????? ???${object.number} ??????????????????`,
                    url: `${process.env.URL.trim()}/memorandum/${object._id}`,
                    roles: ['admin', '????????????????'],
                    _ids: [object.who, ...object.notifiables]
                })
                object.dateClose = new Date()
            }
            if (JSON.stringify(object.routes) === JSON.stringify(routes)) {
                let index = undefined
                for (let i = 0; i < routes.length; i++) {
                    if (index === undefined && (!routes[i].confirmation || routes[i].cancel)) {
                        index = i
                    }
                }
                await sendWebPushByRolesIds({
                    title: '?????????????????? ?????????????? ????????????????',
                    message: `?????????????????? ?????????????? ???${object.number} ????????????????`,
                    url: `${process.env.URL.trim()}/memorandum/${object._id}`,
                    roles: ['admin', '????????????????'],
                    _ids: [routes[index].user]
                })
            }
            else {
                object.routes = routes
                if (!['????????????', '????????????????', '????????????????'].includes(object.status)) {
                    let status = '??????????????????'
                    for (let i = 0; i < routes.length; i++) {
                        let cancel = routes[i].cancel && routes[i].cancel.toString() !== new Date(0).toString()
                        let confirmation = routes[i].confirmation && routes[i].confirmation.toString() !== new Date(0).toString()
                        if (cancel) {
                            status = '????????????'
                        }
                        else if (confirmation && status !== '????????????') {
                            status = '????????????'
                        }
                        else if (!confirmation && status !== '????????????') {
                            status = '??????????????????'
                        }
                    }
                    object.status = status
                }
                if (object.status === '????????????') {
                    await sendWebPushByRolesIds({
                        title: '?????????????????? ?????????????? ??????????????',
                        message: `?????????????????? ?????????????? ???${object.number} ??????????????`,
                        url: `${process.env.URL.trim()}/memorandum/${object._id}`,
                        roles: ['admin', '????????????????'],
                        _ids: [object.who, ...object.notifiables]
                    })
                }
                else if (object.status === '??????????????????') {
                    let index = 0
                    for (let i = 0; i < routes.length; i++) {
                        if (index === undefined && !routes[i].confirmation) {
                            index = i
                        }
                    }
                    await sendWebPushByRolesIds({
                        title: '?????????????????? ?????????????? ????????????????',
                        message: `?????????????????? ?????????????? ???${object.number} ????????????????`,
                        url: `${process.env.URL.trim()}/memorandum/${object._id}`,
                        roles: ['admin', '????????????????'],
                        _ids: [routes[index].user]
                    })
                }
                else if (object.status === '????????????') {
                    await sendWebPushByRolesIds({
                        title: '?????????????????? ?????????????? ????????????????',
                        message: `?????????????????? ?????????????? ???${object.number} ????????????????`,
                        url: `${process.env.URL.trim()}/memorandum/${object._id}`,
                        roles: ['admin', '????????????????'],
                        _ids: [object.who]
                    })
                }
            }
            await object.save();
            pubsub.publish(RELOAD_DATA, {
                reloadData: {
                    type: 'SET',
                    who: user._id,
                    ids: [object.who, object.whom, ...object.notifiables],
                    roles: ['admin', '????????????????'],
                    memorandum: await MemorandumOsSupara.findOne({
                        _id: object._id
                    })
                        .populate({
                            path: 'who',
                            select: 'name _id'
                        })
                        .populate({
                            path: 'whom',
                            select: 'name _id'
                        })
                        .populate({
                            path: 'notifiables',
                            select: 'name _id'
                        })
                        .populate({
                            path: 'routes',
                            populate: {
                                path: 'user',
                                select: 'name _id'
                            }
                        })
                        .lean()
                }
            });
            return {data: 'OK'}
        }
    },
    deleteMemorandum: async(parent, { _id }, {user}) => {
        if(user.checkedPinCode) {
            let memorandums = await MemorandumOsSupara.find({_id: {$in: _id}}).select('_id who whom notifiables').lean()
            for(let i = 0; i<memorandums.length; i++) {
                pubsub.publish(RELOAD_DATA, { reloadData: {
                    type: 'DELETE',
                    who: user._id,
                    ids: [memorandums[i].who, memorandums[i].whom, ...memorandums[i].notifiables],
                    roles: ['admin', '????????????????'],
                    memorandum: {
                        _id: memorandums[i]._id
                    }
                } });
                await MemorandumOsSupara.deleteMany({_id: _id[i]})
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