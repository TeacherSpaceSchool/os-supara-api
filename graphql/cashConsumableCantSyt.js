const CashConsumableCantSyt = require('../models/cashConsumableCantSyt');
const ApplicationCantSyt = require('../models/applicationCantSyt');
const UserCantSyt = require('../models/userCantSyt');
const {changeBalance} = require('./balanceCantSyt');
const mongoose = require('mongoose')
const randomstring = require('randomstring');
const { pubsub } = require('./index');
const RELOAD_DATA = 'RELOAD_DATA';
const { sendWebPushByRolesIds } = require('../module/webPush');
const ExpenseReportCantSyt = require('../models/expenseReportCantSyt');
const ExcelJS = require('exceljs');
const app = require('../app');
const fs = require('fs');
const path = require('path');
const { urlMain, pdDDMMYYYY } = require('../module/const');

const type = `
  type CashConsumable {
      _id: ID
      createdAt: Date
      number: String
      amount: Int
      supplier: User
      dateClose: Date
      comment: String
      budget: String
      currencyType: String
 }
`;

const query = `
    cashConsumables(search: String!, date: String!, skip: Int!): [CashConsumable]
    cashConsumablesForExpenseReport: [CashConsumable]
    cashConsumable(_id: ID!): CashConsumable
    unloadingCashConsumable(_id: ID!): Data
`;

const mutation = `
    addCashConsumable(budget: String!, supplier: ID!, amount: Int!, comment: String!, currencyType: String!): Data
    deleteCashConsumable(_id: [ID]!): Data
`;

const resolvers = {
    cashConsumablesForExpenseReport: async(parent, ctx, {user}) => {
        if(user.role==='снабженец') {
            let res = await ExpenseReportCantSyt.findOne({supplier: user._id, status: 'принят'}).sort('-createdAt')
            res = await CashConsumableCantSyt.find({
                supplier: user._id,
                ...res?{createdAt: {$gte: res.createdAt}}:{}
            })
                .populate('supplier')
                .sort('createdAt')
                .lean()
            return res
        }
    },
    cashConsumables: async(parent, {search, date, skip}, {user}) => {
        let dateStart;
        let dateEnd;
        if(date!==''){
            dateStart = new Date(date)
            dateStart.setHours(3, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
        }
        let users
        if(search.length){
            users = await UserCantSyt.find({name: {'$regex': search, '$options': 'i'}}).distinct('_id').lean()
        }
        let cashConsumables
        if(user.role==='снабженец'){
            cashConsumables = await CashConsumableCantSyt.find({
                supplier: user._id,
                ...search.length?{number: {'$regex': search, '$options': 'i'}}:{},
                ...date!==''?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{}
            })
                .populate('supplier')
                .sort('-createdAt')
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }
        else if(['admin', 'менеджер', 'бухгалтерия', 'кассир'].includes(user.role)){
            cashConsumables = await CashConsumableCantSyt.find({
                ...search.length?{
                    $or: [
                        {number: {'$regex': search, '$options': 'i'}},
                        {supplier: {$in: users}},
                    ]
                }:{},
                ...date!==''?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{}
            })
                .populate('supplier')
                .sort('-createdAt')
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }
        return cashConsumables
    },
    cashConsumable: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            return await CashConsumableCantSyt.findOne({
                _id: _id
            })
                .populate('supplier')
                .lean()
        }
        else return null
    },
    unloadingCashConsumable: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            let cashConsumable =  await CashConsumableCantSyt.findOne({
                _id: _id
            })
                .populate('supplier')
                .lean()
            let workbook = new ExcelJS.Workbook();
            let worksheet;
            worksheet = await workbook.addWorksheet(`Заявка на получение денежных средств №${cashConsumable.number}`);
            let row = 1;
            worksheet.getCell(`C${row}`).font = {bold: true};
            worksheet.getCell(`C${row}`).value = `Ссылка: ${process.env.URL.trim()}/cashconsumable/${cashConsumable._id}`;
            row += 1;
            worksheet.getCell(`C${row}`).font = {bold: true};
            worksheet.getCell(`C${row}`).value = `Заявка на получение денежных средств №${cashConsumable.number}`;
            row += 2;
            worksheet.getCell(`A${row}`).value = `Снабженец: ${cashConsumable.supplier.name}`;
            if(cashConsumable.comment&&cashConsumable.comment.length) {
                row += 1;
                worksheet.getCell(`A${row}`).value = `Обоснование: ${cashConsumable.comment}`;
            }
            row += 1;
            worksheet.getCell(`A${row}`).value = `Сумма и валюта: ${cashConsumable.amount} ${cashConsumable.currencyType}  Дата оплаты: ${pdDDMMYYYY(cashConsumable.createdAt)}`;
            if(cashConsumable.budget&&cashConsumable.budget.length) {
                row += 1;
                worksheet.getCell(`A${row}`).value = `Отметка по бюджету: ${cashConsumable.budget}`;
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
    addCashConsumable: async(parent, {budget, supplier, amount, comment, currencyType}, {user}) => {
        if(['бухгалтерия', 'кассир'].includes(user.role)){
            let number = randomstring.generate({length: 5, charset: 'numeric'});
            while (await CashConsumableCantSyt.findOne({number: number}).lean())
                number = randomstring.generate({length: 5, charset: 'numeric'});
            let newCashConsumable = new CashConsumableCantSyt({
                comment: comment,
                number: number,
                amount: amount,
                supplier: supplier,
                currencyType: currencyType,
                budget: budget
            });
            newCashConsumable = await CashConsumableCantSyt.create(newCashConsumable);
            await sendWebPushByRolesIds({title: 'Кассовый расходник добавлен', message: `Кассовый расходник №${newCashConsumable.number} добавлен`, url: `${process.env.URL.trim()}/cashconsumable/${newCashConsumable._id}`, roles: ['admin', 'менеджер'], _ids: [newCashConsumable.supplier]} )
            pubsub.publish(RELOAD_DATA, { reloadData: {
                type: 'ADD',
                who: user._id,
                ids: [newCashConsumable.supplier],
                roles: ['бухгалтерия', 'кассир', 'admin', 'менеджер'],
                application: undefined,
                cashConsumable: await CashConsumableCantSyt.findOne({
                    _id: newCashConsumable._id
                })
                    .populate('supplier')
                    .lean(),
                waybill: undefined,
                expenseReport: undefined,
                balance: undefined,
            } });
            await changeBalance({supplier: supplier, currencyType: currencyType, addAmount: amount, removeAmount: 0})
            return {data: 'OK'}
        }
    },
    deleteCashConsumable: async(parent, {_id}, {user}) => {
        if(['admin', 'менеджер', 'бухгалтерия', 'кассир'].includes(user.role)) {
            for(let i = 0; i<_id.length; i++) {
                let cashConsumable = await CashConsumableCantSyt.findById(_id[i]).lean()
                await changeBalance({supplier: cashConsumable.supplier, currencyType: cashConsumable.currencyType, addAmount: 0, removeAmount: cashConsumable.amount})
                pubsub.publish(RELOAD_DATA, {
                    reloadData: {
                        type: 'DELETE',
                        who: user._id,
                        ids: [cashConsumable.supplier],
                        roles: ['бухгалтерия', 'кассир', 'admin', 'менеджер'],
                        application: undefined,
                        cashConsumable: {_id: cashConsumable._id},
                        waybill: undefined,
                        expenseReport: undefined,
                        balance: undefined,
                    }
                });
                await CashConsumableCantSyt.deleteMany({_id: _id[i]})
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