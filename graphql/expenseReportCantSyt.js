const ApplicationCantSyt = require('../models/applicationCantSyt');
const UserCantSyt = require('../models/userCantSyt');
const ExpenseReportCantSyt = require('../models/expenseReportCantSyt');
const DivisionCantSyt = require('../models/divisionCantSyt');
const CashConsumableCantSyt = require('../models/cashConsumableCantSyt');
const BalanceCantSyt = require('../models/balanceCantSyt');
const WaybillCantSyt = require('../models/waybillCantSyt');
const mongoose = require('mongoose')
const randomstring = require('randomstring');
const {changeBalance} = require('./balanceCantSyt');
const { pubsub } = require('./index');
const { checkInt, pdDDMMYYYY, urlMain } = require('../module/const');
const RELOAD_DATA = 'RELOAD_DATA';
const { sendWebPushByRolesIds } = require('../module/webPush');
const ExcelJS = require('exceljs');
const app = require('../app');
const fs = require('fs');
const path = require('path');
const uuidv1 = require('uuid/v1.js');

const type = `
  type ExpenseReport {
    _id: ID
    sync: Int
    createdAt: Date
    status: String
    number: String
    dateClose: Date
    acceptHead: Date
    applications: [Application]
    waybills: [Waybill]
    cashConsumables: [CashConsumable]
    supplier: User
    balanceStart: [Currency]
    receivedAmount: [Currency]
    expense: [Currency]
    overExpense: [Currency]
    outCashbox: [Currency]
    balanceEnd: [Currency]
    addedItems: [UsedItems]
 }
`;

const query = `
    expenseReports(search: String!, filter: String!, sort: String!, date: String!, skip: Int!): [ExpenseReport]
    expenseReport(_id: ID!): ExpenseReport
    filterExpenseReport: [Filter]
    sortExpenseReport: [Sort]
    unloadingExpenseReport(_id: ID!): Data
`;

const mutation = `
    addExpenseReport(outCashbox: [InputCurrency]!, addedItems: [InputItems]!): Data
    setExpenseReport(_id: ID!, acceptHead: Date, ): Data
    deleteExpenseReport(_id: [ID]!): Data
`;

const resolvers = {
    expenseReports: async(parent, {search, filter, sort, date, skip}, {user}) => {
        let dateStart;
        let dateEnd;
        if(date!==''){
            dateStart = new Date(date)
            dateStart.setHours(3, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
        }
        let users
        let applications
        if(search.length){
            users = await UserCantSyt.find({name: {'$regex': search, '$options': 'i'}}).distinct('_id').lean()
            applications = await ApplicationCantSyt.find({number: {'$regex': search, '$options': 'i'}}).distinct('_id').lean()
        }
        let expenseReports
        if(user.role==='снабженец'){
            expenseReports = await ExpenseReportCantSyt.find({
                supplier: user._id,
                ...filter.length?{status: filter}:{},
                ...search.length?{
                    $or: [
                        {number: {'$regex': search, '$options': 'i'}},
                        {applications: {$in: applications}}
                    ]
                }:{}
            })
                .populate('applications')
                .populate('supplier')
                .populate('waybills')
                .populate('cashConsumables')
                .sort(sort)
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }
        else if(user.role==='начальник отдела'){
            expenseReports = await DivisionCantSyt.find({head: user._id}).distinct('suppliers')
            expenseReports = await ExpenseReportCantSyt.find({
                supplier: {$in: expenseReports},
                ...filter.length?{status: filter}:{},
                ...search.length?{
                    $or: [
                        {number: {'$regex': search, '$options': 'i'}},
                        {applications: {$in: applications}}
                    ]
                }:{}
            })
                .populate('applications')
                .populate('supplier')
                .populate('waybills')
                .populate('cashConsumables')
                .sort(sort)
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }
        else if(['admin', 'менеджер'].includes(user.role)){
            expenseReports = await ExpenseReportCantSyt.find({
                ...filter.length?{status: filter}:{},
                ...search.length?{
                    $or: [
                        {supplier: users},
                        {number: {'$regex': search, '$options': 'i'}},
                        {applications: {$in: applications}},
                    ]
                }:{}
            })
                .populate('applications')
                .populate('supplier')
                .populate('waybills')
                .populate('cashConsumables')
                .sort(sort)
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }
        return expenseReports
    },
    expenseReport: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            return await ExpenseReportCantSyt.findById(_id)
                .populate('applications')
                .populate('supplier')
                .populate('waybills')
                .populate('cashConsumables')
                .lean()
        }
        else return null
    },
    filterExpenseReport: async() => {
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
            }
        ]
        return filters
    },
    sortExpenseReport: async() => {
        let sorts = [
            {
                name: 'Дата создания',
                field: 'createdAt'
            },
            {
                name: 'Дата закрытия',
                field: 'dateClose'
            },
        ]
        return sorts
    },
    unloadingExpenseReport: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            let expenseReport = await ExpenseReportCantSyt.findById(_id)
                .populate('applications')
                .populate('supplier')
                .populate({
                    path: 'waybills',
                    populate: {
                        path: 'application',
                        populate: {
                            path: 'division'
                        }
                    }
                })
                .populate('cashConsumables')
                .lean()
            let items = expenseReport.waybills.reduce((accumulator, currentValue)=>[...accumulator, ...currentValue.items.map(item=>{return {division: currentValue.application.division.name, _id: currentValue._id, number: currentValue.number, createdAt: currentValue.createdAt, ...item}})], [])
            let workbook = new ExcelJS.Workbook();
            let worksheet;
            worksheet = await workbook.addWorksheet(`Авансовый отчет №${expenseReport.number}`);
            worksheet.getColumn(1).width = 10;
            worksheet.getColumn(2).width = 30;
            worksheet.getColumn(3).width = 10;
            worksheet.getColumn(4).width = 10;
            worksheet.getColumn(5).width = 10;
            worksheet.getColumn(6).width = 30;
            worksheet.getColumn(7).width = 30;
            worksheet.getColumn(8).width = 30;
            let row = 1;
            worksheet.getCell(`C${row}`).font = {bold: true};
            worksheet.getCell(`C${row}`).value = `Ссылка: ${process.env.URL.trim()}/expensereport/${expenseReport._id}`;
            row += 1;
            worksheet.getCell(`C${row}`).font = {bold: true};
            worksheet.getCell(`C${row}`).value = `Авансовый отчет №${expenseReport.number}`;
            row += 2;
            worksheet.getCell(`A${row}`).value = `Снабженец: ${expenseReport.supplier.name}`;
            row += 1;
            worksheet.getCell(`A${row}`).value = `Дата: ${pdDDMMYYYY(expenseReport.createdAt)}`;
            row += 2;
            worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`A${row}`).value = 'Дата';
            worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`C${row}`).value = 'Кол-во';
            worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`D${row}`).value = 'Цена';
            worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`E${row}`).value = 'Сумма';
            worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`F${row}`).value = 'Коментарий';
            worksheet.getCell(`G${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`G${row}`).value = 'Регион';
            worksheet.getCell(`H${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`H${row}`).value = 'Ссылка';
            row += 1;
            for(let i = 0; i<expenseReport.balanceStart.length; i++){
                worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`B${row}`).value = 'Остаток на начало периода';
                worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).value = `${expenseReport.balanceStart[i].value} ${expenseReport.balanceStart[i].name}`;
                worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`G${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`H${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                row += 1;
            }
            for(let i = 0; i<expenseReport.cashConsumables.length; i++){
                worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`A${row}`).value = pdDDMMYYYY(expenseReport.cashConsumables[i].createdAt);
                worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`B${row}`).value = 'Получено из кассы';
                worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).value = `${expenseReport.cashConsumables[i].amount} ${expenseReport.cashConsumables[i].currencyType}`;
                worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`F${row}`).alignment = { wrapText: true };
                worksheet.getCell(`F${row}`).value = expenseReport.cashConsumables[i].comment;
                worksheet.getCell(`G${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`H${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`H${row}`).alignment = { wrapText: true };
                worksheet.getCell(`H${row}`).value = `${process.env.URL.trim()}/cashconsumable/${expenseReport.cashConsumables[i]._id}`;
                row += 1;
            }
            for(let i = 0; i<expenseReport.receivedAmount.length; i++){
                worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`B${row}`).value = 'Итого получено';
                worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).value = `${expenseReport.receivedAmount[i].value} ${expenseReport.receivedAmount[i].name}`;
                worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`G${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`H${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                row += 1;
            }
            worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`G${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`H${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            row += 1;
            for(let i = 0; i<items.length; i++){
                worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`A${row}`).value = pdDDMMYYYY(items[i].createdAt);
                worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`B${row}`).alignment = { wrapText: true };
                worksheet.getCell(`B${row}`).value = items[i].name;
                worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`C${row}`).value = `${items[i].count} ${items[i].unit}`;
                worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`D${row}`).value = `${items[i].price} ${items[i].currency}`;
                worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).value = `${items[i].count*items[i].price} ${items[i].currency}`;
                worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`F${row}`).alignment = { wrapText: true };
                worksheet.getCell(`F${row}`).value = items[i].comment;
                worksheet.getCell(`G${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`G${row}`).alignment = { wrapText: true };
                worksheet.getCell(`G${row}`).value = items[i].division;
                worksheet.getCell(`H${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`H${row}`).alignment = { wrapText: true };
                worksheet.getCell(`H${row}`).value = `${process.env.URL.trim()}/waybill/${items[i]._id}`;
                row += 1;
            }
            for(let i = 0; i<expenseReport.expense.length; i++){
                worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`B${row}`).value = 'Итого расход';
                worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`E${row}`).value = `${expenseReport.expense[i].value} ${expenseReport.expense[i].name}`;
                worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`G${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                worksheet.getCell(`H${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                row += 1;
            }
            worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`G${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            worksheet.getCell(`H${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
            row += 1;
            if(expenseReport.overExpense.length){
                for(let i = 0; i<expenseReport.overExpense.length; i++){
                    worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`B${row}`).value = 'Перерасход';
                    worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`E${row}`).value = `${expenseReport.overExpense[i].value} ${expenseReport.overExpense[i].name}`;
                    worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`G${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`H${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    row += 1;
                }
            }
            if(expenseReport.outCashbox.length){
                for(let i = 0; i<expenseReport.outCashbox.length; i++){
                    worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`B${row}`).value = 'Сдано в кассу';
                    worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`E${row}`).value = `${expenseReport.outCashbox[i].value} ${expenseReport.outCashbox[i].name}`;
                    worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`G${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`H${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    row += 1;
                }
            }
            if(expenseReport.balanceEnd.length){
                for(let i = 0; i<expenseReport.balanceEnd.length; i++){
                    worksheet.getCell(`A${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`B${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`B${row}`).value = 'Остаток на конец периода';
                    worksheet.getCell(`C${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`D${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`E${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`E${row}`).value = `${expenseReport.balanceEnd[i].value} ${expenseReport.balanceEnd[i].name}`;
                    worksheet.getCell(`F${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`G${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    worksheet.getCell(`H${row}`).border = {top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
                    row += 1;
                }
            }
            if(expenseReport.acceptHead)
                worksheet.getCell(`A${row}`).value = `Принят ${pdDDMMYYYY(expenseReport.acceptHead)}`;


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
    addExpenseReport: async(parent, {outCashbox, addedItems}, {user}) => {
        if('снабженец'===user.role) {
            let number = randomstring.generate({length: 5, charset: 'numeric'});
            while (await ExpenseReportCantSyt.findOne({number: number}).lean())
                number = randomstring.generate({length: 5, charset: 'numeric'});
            let lastExpenseReport = await ExpenseReportCantSyt.findOne({supplier: user._id, status: 'принят'}).select('createdAt').sort('-createdAt')
            let applications = await ApplicationCantSyt.find({
                status: 'принят',
                supplier: user._id
            })
                .sort('-createdAt')
                .lean()
            let waybills = await WaybillCantSyt.find({
                status: 'принят',
                application: {$in: applications.map(application=>application._id)}
            }).lean()
            let cashConsumables = await CashConsumableCantSyt.find({supplier: user._id, ...lastExpenseReport?{createdAt: {$gt: lastExpenseReport.createdAt}}:{}}).lean()
            let balance = await BalanceCantSyt.findOne({supplier: user._id})

            let balanceEnd1 = {}, balanceEnd2 = {}, balanceEnd = []
            let balanceStart1 = {}, balanceStart = []
            balance = balance?balance.amount:[]
            for(let i = 0; i<balance.length; i++){
                balanceStart1[balance[i].name] = balance[i].value
                balanceEnd1[balance[i].name] = balance[i].value
            }
            for(let i = 0; i<waybills.length; i++){
                for(let i1 = 0; i1<waybills[i].amount.length; i1++) {
                    if (!balanceStart1[waybills[i].amount[i1].name]) {
                        balanceStart1[waybills[i].amount[i1].name] = 0
                        balanceEnd1[waybills[i].amount[i1].name] = 0
                    }
                }
            }
            for(let i = 0; i<addedItems.length; i++){
                if (balanceStart1[addedItems[i].currency]==undefined) {
                    balanceStart1[addedItems[i].currency] = 0
                    balanceEnd1[addedItems[i].currency] = 0
                }
            }

            let keys
            let receivedAmount1 = {}, receivedAmount = []
            if(cashConsumables.length) {
                for(let i = 0; i<cashConsumables.length; i++){
                    if (!receivedAmount1[cashConsumables[i].currencyType])
                        receivedAmount1[cashConsumables[i].currencyType] = 0
                    receivedAmount1[cashConsumables[i].currencyType]+=cashConsumables[i].amount
                }
                keys = Object.keys(receivedAmount1)
                for(let i = 0; i<keys.length; i++){
                    receivedAmount.push({name: keys[i], value: balanceStart1[keys[i]]})
                    balanceStart1[keys[i]] -= receivedAmount1[keys[i]]
                    balanceStart.push({name: keys[i], value: checkInt(balanceStart1[keys[i]])})
                }
                for(let i = 0; i<waybills.length; i++){
                    for(let i1 = 0; i1<waybills[i].amount.length; i1++) {
                        if (receivedAmount1[waybills[i].amount[i1].name]==undefined) {
                            balanceStart.push({name: waybills[i].amount[i1].name, value: checkInt(balanceStart1[waybills[i].amount[i1].name])})
                            receivedAmount.push({name: waybills[i].amount[i1].name, value: checkInt(balanceStart1[waybills[i].amount[i1].name])})
                            receivedAmount1[waybills[i].amount[i1].name] = checkInt(balanceStart1[waybills[i].amount[i1].name])
                        }
                    }
                }
                for(let i = 0; i<addedItems.length; i++){
                    if (receivedAmount1[addedItems[i].currency]==undefined) {
                        balanceStart.push({name: addedItems[i].currency, value: checkInt(balanceStart1[addedItems[i].currency])})
                        receivedAmount.push({name: addedItems[i].currency, value: checkInt(balanceStart1[addedItems[i].currency])})
                    }
                }
            }
            else {
                for(let i = 0; i<waybills.length; i++){
                    for(let i1 = 0; i1<waybills[i].amount.length; i1++) {
                        if(!(balanceStart.filter(element=>element.name===waybills[i].amount[i1].name)).length)
                            balanceStart.push({name: waybills[i].amount[i1].name, value: balanceStart1[waybills[i].amount[i1].name]})
                    }
                }
                for(let i = 0; i<addedItems.length; i++){
                    if(!(balanceStart.filter(element=>element.name===addedItems[i].currency)).length)
                        balanceStart.push({name: addedItems[i].currency, value: checkInt(balanceStart1[addedItems[i].currency])})
                }
            }
            let overExpense = []
            let expense1 = {}, expense = []
            for(let i = 0; i<waybills.length; i++){
                for(let i1 = 0; i1<waybills[i].amount.length; i1++) {
                    if (!expense1[waybills[i].amount[i1].name])
                        expense1[waybills[i].amount[i1].name] = 0
                    expense1[waybills[i].amount[i1].name]+=waybills[i].amount[i1].value
                }
            }
            for(let i = 0; i<addedItems.length; i++){
                if (expense1[addedItems[i].currency]==undefined)
                    expense1[addedItems[i].currency] = 0
                expense1[addedItems[i].currency]+=addedItems[i].price*addedItems[i].count
            }

            let outCashbox1 = {}
            for(let i = 0; i<outCashbox.length; i++){
                outCashbox1[outCashbox[i].name] = outCashbox[i].value
            }

            keys = Object.keys(expense1)
            for(let i = 0; i<keys.length; i++){
                balanceEnd1[keys[i]] -= expense1[keys[i]]
                expense.push({name: keys[i], value: expense1[keys[i]]})
                balanceEnd2[keys[i]] = balanceEnd1[keys[i]]
            }
            keys = Object.keys(outCashbox1)
            for (let i = 0; i < keys.length; i++) {
                balanceEnd1[keys[i]] -= outCashbox1[keys[i]]
                balanceEnd2[keys[i]] = balanceEnd1[keys[i]]
            }
            keys = Object.keys(balanceEnd2)
            for(let i = 0; i<keys.length; i++){
                if(balanceEnd2[keys[i]]<0)
                    overExpense.push({name: keys[i], value: balanceEnd2[keys[i]]})
                balanceEnd.push({name: keys[i], value: balanceEnd2[keys[i]]})
            }

            let newExpenseReport = new ExpenseReportCantSyt({
                sync: 0,
                status: 'обработка',
                number: number,
                applications: applications.map(application=>application._id),
                waybills: waybills.map(waybill=>waybill._id),
                cashConsumables: cashConsumables.map(cashConsumable=>cashConsumable._id),
                supplier: user._id,
                addedItems: addedItems.sort((a, b)=>a.name > b.name?1:a.name < b.name?-1:0),
                balanceStart: balanceStart.sort((a, b)=>a.name > b.name?1:a.name < b.name?-1:0),
                receivedAmount: receivedAmount.sort((a, b)=>a.name > b.name?1:a.name < b.name?-1:0),
                expense: expense.sort((a, b)=>a.name > b.name?1:a.name < b.name?-1:0),
                overExpense: overExpense.sort((a, b)=>a.name > b.name?1:a.name < b.name?-1:0),
                outCashbox: outCashbox.sort((a, b)=>a.name > b.name?1:a.name < b.name?-1:0),
                balanceEnd: balanceEnd.sort((a, b)=>a.name > b.name?1:a.name < b.name?-1:0),
                GUID: await uuidv1()
            });
            newExpenseReport = await ExpenseReportCantSyt.create(newExpenseReport);

            await sendWebPushByRolesIds({title: 'Авансовый отчет добавлен', message: `Авансовый отчет №${newExpenseReport.number} добавлен`, url: `${process.env.URL.trim()}/expensereport/${newExpenseReport._id}`, roles: ['admin', 'менеджер', 'начальник отдела'], _ids: []} )

            pubsub.publish(RELOAD_DATA, { reloadData: {
                type: 'ADD',
                who: user._id,
                ids: [newExpenseReport.supplier],
                roles: ['admin', 'менеджер', 'начальник отдела'],
                application: undefined,
                cashConsumable: undefined,
                waybill: undefined,
                expenseReport: await ExpenseReportCantSyt.findById(newExpenseReport._id)
                    .populate('applications')
                    .populate('supplier')
                    .populate('waybills')
                    .populate('cashConsumables')
                    .lean(),
                balance: undefined,
            } });
            return {data: 'OK'}
        }
    },
    setExpenseReport: async(parent, {_id, acceptHead}, {user}) => {
        if(['admin', 'менеджер', 'начальник отдела'].includes(user.role)) {
            let object = await ExpenseReportCantSyt.findById(_id).populate('waybills')
            if (acceptHead) {
                object.acceptHead = new Date()
                let allExpense = {}
                for(let i = 0; i<object.expense.length; i++){
                    if (!allExpense[object.expense[i].name])
                        allExpense[object.expense[i].name] = 0
                    allExpense[object.expense[i].name]+=object.expense[i].value
                }
                for(let i = 0; i<object.outCashbox.length; i++){
                    if (!allExpense[object.outCashbox[i].name])
                        allExpense[object.outCashbox[i].name] = 0
                    allExpense[object.outCashbox[i].name]+=object.outCashbox[i].value
                }

                let keys = Object.keys(allExpense)
                for(let i = 0; i<keys.length; i++){
                    await changeBalance({supplier: object.supplier, currencyType: keys[i], addAmount: 0, removeAmount: allExpense[keys[i]]})
                }

                object.status = 'принят'
                object.dateClose = new Date()
                await ApplicationCantSyt.updateMany({_id: {$in: object.applications}}, {status: 'выполнен', dateClose: new Date()})
            }
            await object.save();

            if (object.status === 'принят') {
                await sendWebPushByRolesIds({
                    title: 'Авансовый отчет принят',
                    message: `Авансовый отчет №${object.number} принят`,
                    url: `${process.env.URL.trim()}/expensereport/${object._id}`,
                    roles: ['admin', 'менеджер'],
                    _ids: [object.supplier]
                })
            }
            else {
                await sendWebPushByRolesIds({
                    title: 'Авансовый отчет изменен',
                    message: `Авансовый отчет №${object.number} изменен`,
                    url: `${process.env.URL.trim()}/expensereport/${object._id}`,
                    roles: ['admin', 'менеджер', 'начальник отдела'],
                    _ids: []
                })
            }

            pubsub.publish(RELOAD_DATA, {
                reloadData: {
                    type: 'SET',
                    who: user._id,
                    ids: [object.supplier],
                    roles: ['admin', 'менеджер', 'начальник отдела'],
                    application: undefined,
                    cashConsumable: undefined,
                    waybill: undefined,
                    expenseReport: await ExpenseReportCantSyt.findById(object._id)
                        .populate('applications')
                        .populate('supplier')
                        .populate('waybills')
                        .populate('cashConsumables')
                        .lean(),
                    balance: undefined,
                }
            });
        }
        return {data: 'OK'}
    },
    deleteExpenseReport: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер', 'снабженец'].includes(user.role)) {
            for (let i = 0; i < _id.length; i++) {
                let expenseReport = await ExpenseReportCantSyt.findById(_id[i]).lean()
                pubsub.publish(RELOAD_DATA, {
                    reloadData: {
                        type: 'DELETE',
                        who: user._id,
                        ids: [expenseReport.supplier],
                        roles: ['admin', 'менеджер', 'начальник отдела'],
                        application: undefined,
                        cashConsumable: undefined,
                        waybill: undefined,
                        expenseReport: {_id: expenseReport._id},
                        balance: undefined,
                    }
                });
                await ExpenseReportCantSyt.deleteMany({_id: _id[i]})
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