const express = require('express');
const router = express.Router();
const employmentLog = require('logger').createLogger('employment.log');
const UserCantSyt = require('../models/userCantSyt');
const ItemCantSyt = require('../models/itemCantSyt');
const randomstring = require('randomstring');
const ModelsErrorCantSyt = require('../models/errorCantSyt');
const CategoryCantSyt = require('../models/categoryCantSyt');
const ExpenseReportCantSyt = require('../models/expenseReportCantSyt');
const CashConsumableCantSyt = require('../models/cashConsumableCantSyt');
const { pubsub } = require('../graphql/index');
const RELOAD_DATA = 'RELOAD_DATA';
const { sendWebPushByRolesIds } = require('../module/webPush');
const {changeBalance} = require('../graphql/balanceCantSyt');
const { checkInt, pdDDMMYYYY } = require('../module/const');
const builder = require('xmlbuilder');

router.post('/put/employment', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    let _object
    try{
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            if(req.body.elements[0].elements[i].attributes.del!=='1') {
                _object = await UserCantSyt.findOne({GUID: req.body.elements[0].elements[i].attributes.guid})
                if (!_object) {
                    _object = new UserCantSyt({
                        login: randomstring.generate(20),
                        role: 'снабженец',
                        status: 'active',
                        password: '12345678',
                        name: req.body.elements[0].elements[i].attributes.name,
                        GUID: req.body.elements[0].elements[i].attributes.guid
                    });
                    await UserCantSyt.create(_object);
                }
                else {
                    _object.del = null
                    _object.name = req.body.elements[0].elements[i].attributes.name
                    await _object.save();
                }
            }
            else {
                await UserCantSyt.updateMany({GUID: req.body.elements[0].elements[i].attributes.guid}, {del: 'deleted'})
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        _object = new ModelsErrorCantSyt({
            err: err.message,
            path: 'put employment'
        });
        await ModelsErrorCantSyt.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/put/cashconsumable', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    let _object
    try{
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            _object = await UserCantSyt.findOne({GUID: req.body.elements[0].elements[i].attributes.supplier}).lean()
            let cashConsumable = await CashConsumableCantSyt.findOne({GUID: req.body.elements[0].elements[i].attributes.guid}).lean()
            if(_object) {
                if(req.body.elements[0].elements[i].attributes.del!=='1'&&!cashConsumable) {
                    let number = randomstring.generate({length: 5, charset: 'numeric'});
                    while (await CashConsumableCantSyt.findOne({number: number}).lean())
                        number = randomstring.generate({length: 5, charset: 'numeric'});
                    let newCashConsumable = new CashConsumableCantSyt({
                        comment: req.body.elements[0].elements[i].attributes.comment,
                        number: number,
                        amount: checkInt(req.body.elements[0].elements[i].attributes.amount),
                        supplier: _object._id,
                        currencyType: req.body.elements[0].elements[i].attributes.currencyType,
                        budget: req.body.elements[0].elements[i].attributes.budget,
                        GUID: req.body.elements[0].elements[i].attributes.guid
                    });
                    newCashConsumable = await CashConsumableCantSyt.create(newCashConsumable);
                    await sendWebPushByRolesIds({
                        title: 'Кассовый расходник добавлен',
                        message: `Кассовый расходник №${newCashConsumable.number} добавлен`,
                        url: `${process.env.URL.trim()}/cashconsumable/${newCashConsumable._id}`,
                        roles: ['admin', 'менеджер'],
                        _ids: [newCashConsumable.supplier]
                    })
                    pubsub.publish(RELOAD_DATA, {
                        reloadData: {
                            type: 'ADD',
                            who: null,
                            ids: [newCashConsumable.supplier],
                            roles: ['admin', 'менеджер'],
                            application: undefined,
                            cashConsumable: await CashConsumableCantSyt.findOne({
                                _id: newCashConsumable._id
                            })
                                .populate('supplier')
                                .lean(),
                            waybill: undefined,
                            expenseReport: undefined,
                            balance: undefined,
                        }
                    });
                    await changeBalance({
                        supplier: _object._id,
                        currencyType: req.body.elements[0].elements[i].attributes.currencyType,
                        addAmount: checkInt(req.body.elements[0].elements[i].attributes.amount),
                        removeAmount: 0
                    })
                }
                else if(cashConsumable&&req.body.elements[0].elements[i].attributes.del==='1') {
                    await changeBalance({supplier: cashConsumable.supplier, currencyType: cashConsumable.currencyType, addAmount: 0, removeAmount: cashConsumable.amount})
                    pubsub.publish(RELOAD_DATA, {
                        reloadData: {
                            type: 'DELETE',
                            who: null,
                            ids: [cashConsumable.supplier],
                            roles: ['бухгалтерия', 'кассир', 'admin', 'менеджер'],
                            application: undefined,
                            cashConsumable: {_id: cashConsumable._id},
                            waybill: undefined,
                            expenseReport: undefined,
                            balance: undefined,
                        }
                    });
                    await CashConsumableCantSyt.deleteMany({GUID: req.body.elements[0].elements[i].attributes.guid})
                }
            }
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        _object = new ModelsErrorCantSyt({
            err: err.message,
            path: 'put cashconsumable'
        });
        await ModelsErrorCantSyt.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/out/expensereport', async (req, res, next) => {
    let _objects = await ExpenseReportCantSyt.find({status: 'принят', sync: 0})
        .populate({
            path: 'waybills',
            populate: {
                path: 'application',
                populate: {
                    path: 'division'
                }
            }
        })
        .populate('supplier')
        .populate('cashConsumables')
        .lean()
    try{
        let result = builder.create('root');
        let item
        let receivedAmounts
        let expenseAmounts
        let overExpenses
        let outCashbox
        let balanceEnd
        let waybills
        let waybill
        for(let i=0;i<_objects.length;i++) {
            if(_objects[i].supplier.GUID&&_objects[i].supplier.GUID.length>0) {
                item = result.ele('item')
                    .att('supplier', _objects[i].supplier.GUID)
                    .att('guid', _objects[i].GUID)
                    .att('date', pdDDMMYYYY(_objects[i].createdAt))
                receivedAmounts = item.ele('received_amounts')
                for(let i1 = 0; i1<_objects[i].receivedAmount.length; i1++) {
                    receivedAmounts.ele('received_amount')
                        .att('currency', _objects[i].receivedAmount[i1].name)
                        .att('value', _objects[i].receivedAmount[i1].value)
                }
                expenseAmounts = item.ele('expense_amounts')
                for(let i1 = 0; i1<_objects[i].expense.length; i1++) {
                    expenseAmounts.ele('expense_amount')
                        .att('currency', _objects[i].expense[i1].name)
                        .att('value', _objects[i].expense[i1].value)
                }
                if(_objects[i].overExpense.length>0) {
                    overExpenses = item.ele('over_expenses')
                    for (let i1 = 0; i1 < _objects[i].overExpense.length; i1++) {
                        overExpenses.ele('over_expense')
                            .att('currency', _objects[i].expense[i1].name)
                            .att('value', _objects[i].expense[i1].value)
                    }
                }
                if(_objects[i].outCashbox.length>0&&(_objects[i].outCashbox.filter(element=>element.value>0)).length) {
                    outCashbox = item.ele('out_cashboxes')
                    for (let i1 = 0; i1 < _objects[i].outCashbox.length; i1++) {
                        outCashbox.ele('out_cashbox')
                            .att('currency', _objects[i].outCashbox[i1].name)
                            .att('value', _objects[i].outCashbox[i1].value)
                    }
                }
                balanceEnd = item.ele('balance_ends')
                for(let i1 = 0; i1<_objects[i].balanceEnd.length; i1++) {
                    balanceEnd.ele('balance_end')
                        .att('currency', _objects[i].balanceEnd[i1].name)
                        .att('value', _objects[i].balanceEnd[i1].value)
                }
                waybills = item.ele('waybills')
                for(let i1 = 0; i1<_objects[i].waybills.length; i1++) {
                    waybill = waybills.ele('waybill')
                        .att('seller', _objects[i].waybills[i1].seller)
                        .att('budget', _objects[i].waybills[i1].application.budget?1:0)
                        .att('note', _objects[i].waybills[i1].application.note)
                        .att('payment_type', _objects[i].waybills[i1].application.paymentType)
                        .att('official', _objects[i].waybills[i1].application.official?1:0)
                        .att('comment', _objects[i].waybills[i1].application.comment)
                    for(let i2 = 0; i2<_objects[i].waybills[i1].items.length; i2++) {
                        waybill.ele('item')
                            .att('name', _objects[i].waybills[i1].items[i2].name)
                            .att('unit', _objects[i].waybills[i1].items[i2].unit)
                            .att('price', _objects[i].waybills[i1].items[i2].price)
                            .att('count', _objects[i].waybills[i1].items[i2].count)
                            .att('amount', _objects[i].waybills[i1].items[i2].price*_objects[i].waybills[i1].items[i2].count)
                            .att('currency', _objects[i].waybills[i1].items[i2].currency)
                            .att('comment', _objects[i].waybills[i1].items[i2].comment)
                    }
                }
                if(_objects[i].addedItems.length>0) {
                    waybill = waybills.ele('waybill')
                    for (let i1 = 0; i1 < _objects[i].addedItems.length; i1++) {
                        waybill.ele('item')
                            .att('name', _objects[i].addedItems[i1].name)
                            .att('unit', _objects[i].addedItems[i1].unit)
                            .att('price', _objects[i].addedItems[i1].price)
                            .att('count', _objects[i].addedItems[i1].count)
                            .att('amount', _objects[i].addedItems[i1].price * _objects[i].addedItems[i1].count)
                            .att('currency', _objects[i].addedItems[i1].currency)
                            .att('comment', _objects[i].addedItems[i1].comment)
                    }
                }
            }
        }
        result = result.end({ pretty: true})
        await res.status(200);
        await res.end(result)
    } catch (err) {
        _objects = new ModelsErrorCantSyt({
            err: err.message,
            path: 'out expensereport'
        });
        await ModelsErrorCantSyt.create(_objects)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.post('/confirm/expensereport', async (req, res, next) => {
    res.set('Content+Type', 'application/xml');
    let _object
    try{
        let guids = req.body.elements[0].elements.map(element=>element.attributes.guid)
        for(let i=0;i<req.body.elements[0].elements.length;i++) {
            await ExpenseReportCantSyt.updateMany({GUID: {$in: guids}}, {sync: 1})
        }
        await res.status(200);
        await res.end('success')
    } catch (err) {
        _object = new ModelsErrorCantSyt({
            err: err.message,
            path: 'confirm expensereport'
        });
        await ModelsErrorCantSyt.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

module.exports = router;