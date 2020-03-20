const OutXMLShoroAzyk = require('../models/outXMLShoroAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const { pdDDMMYYYY } = require('../module/const');
const uuidv1 = require('uuid/v1.js');
const xml = require('xml');

module.exports.setOutXMLShoroAzyk = async(invoice) => {
    let outXMLShoroAzyk = await OutXMLShoroAzyk
        .findOne({invoice: invoice._id})
    if(outXMLShoroAzyk){
        outXMLShoroAzyk.status = 'update'
        outXMLShoroAzyk.data = []
        for (let i = 0; i < invoice.orders.length; i++) {
            let guidItem = await Integrate1CAzyk
                .findOne({item: invoice.orders[i].item._id})
            if(guidItem)
                outXMLShoroAzyk.data.push({
                    guid: guidItem.guid,
                    package: Math.round(invoice.orders[i].count/(invoice.orders[i].item.packaging?invoice.orders[i].item.packaging:1)),
                    qt:  invoice.orders[i].count,
                    price: (invoice.orders[i].item.stock?invoice.orders[i].item.stock:invoice.orders[i].item.price),
                    amount: Math.round(invoice.orders[i].count*(invoice.orders[i].item.stock?invoice.orders[i].item.stock:invoice.orders[i].item.price))
                })
        }
        outXMLShoroAzyk.save()
        await InvoiceAzyk.updateMany({_id: invoice._id}, {sync: 1})
    }
    else {
        let guidClient = await Integrate1CAzyk
            .findOne({client: invoice.client._id})
        if(guidClient){
            let district = await DistrictAzyk
                .findOne({client: invoice.client._id, organization: invoice.orders[0].item.organization._id})
            if(district) {
                let guidAgent = await Integrate1CAzyk
                    .findOne({agent: district.agent})
                let guidEcspeditor = await Integrate1CAzyk
                    .findOne({ecspeditor: district.ecspeditor})
                if (guidAgent && guidEcspeditor) {
                    let date = new Date()
                    date.setDate(date.getDate() + 1)
                    let newOutXMLShoroAzyk = new OutXMLShoroAzyk({
                        data: [],
                        guid: await uuidv1(),
                        date: date,
                        number: invoice.number,
                        client: guidClient.guid,
                        agent: guidAgent.guid,
                        forwarder: guidEcspeditor.guid,
                        invoice: invoice._id,
                        status: 'create'
                    });
                    for (let i = 0; i < invoice.orders.length; i++) {
                        let guidItem = await Integrate1CAzyk
                            .findOne({item: invoice.orders[i].item._id})
                        if (guidItem)
                            newOutXMLShoroAzyk.data.push({
                                guid: guidItem.guid,
                                package: Math.round(invoice.orders[i].count / (invoice.orders[i].item.packaging ? invoice.orders[i].item.packaging : 1)),
                                qt: invoice.orders[i].count,
                                price: (invoice.orders[i].item.stock ? invoice.orders[i].item.stock : invoice.orders[i].item.price),
                                amount: Math.round(invoice.orders[i].count * (invoice.orders[i].item.stock ? invoice.orders[i].item.stock : invoice.orders[i].item.price))
                            })
                    }
                    await OutXMLShoroAzyk.create(newOutXMLShoroAzyk);
                    await InvoiceAzyk.updateMany({_id: invoice._id}, {sync: 1})
                }
            }
        }
    }
}

module.exports.cancelOutXMLShoroAzyk = async(invoice) => {
    let outXMLShoroAzyk = await OutXMLShoroAzyk
        .findOne({invoice: invoice._id})
    if(outXMLShoroAzyk){
        outXMLShoroAzyk.status = 'del'
        outXMLShoroAzyk.save()
    }
}

module.exports.checkOutXMLShoroAzyk = async(guid) => {
    let outXMLShoroAzyk = await OutXMLShoroAzyk
        .findOne({guid: guid})
    if(outXMLShoroAzyk){
        outXMLShoroAzyk.status = 'check'
        outXMLShoroAzyk.save()
        await InvoiceAzyk.updateMany({_id: outXMLShoroAzyk.invoice}, {sync: 2})
    }
}

module.exports.getOutXMLShoroAzyk = async() => {
    let result = [ { root: [ { _attr: { mode: 'sales'} }] } ];
    let outXMLShoros = await OutXMLShoroAzyk
        .find({status: {$ne: 'check'}})
        .sort('date')
        .limit(20)
    for(let i=0;i<outXMLShoros.length;i++){
        let item = { item: [{ _attr: { ...(outXMLShoros[i].status==='del'?{del: '1'}:{}), guid: outXMLShoros[i].guid, client: outXMLShoros[i].client, agent: outXMLShoros[i].agent, forwarder: outXMLShoros[i].forwarder, date: pdDDMMYYYY(outXMLShoros[i].date)}}]};
        for(let ii=0;ii<outXMLShoros[i].data.length;ii++){
            (item.item).push({ product: [{ _attr: {
                guid: outXMLShoros[i].data[ii].guid,
                package: outXMLShoros[i].data[ii].package,
                qty:  outXMLShoros[i].data[ii].qt,
                price: outXMLShoros[i].data[ii].price,
                amount: outXMLShoros[i].data[ii].amount
            }}]})
        }
        (result[0].root).push(item)
    }
    result = xml(result, true)
    return result
}