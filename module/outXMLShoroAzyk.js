const OutXMLShoroAzyk = require('../models/outXMLShoroAzyk');
const OutXMLReturnedShoroAzyk = require('../models/outXMLReturnedShoroAzyk');
const OutXMLClientShoroAzyk = require('../models/outXMLClientShoroAzyk');
const ClientAzyk = require('../models/clientAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const UserAzyk = require('../models/userAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');
const ReturnedAzyk = require('../models/returnedAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const AdsAzyk = require('../models/adsAzyk');
const { pdDDMMYYYY } = require('../module/const');
const uuidv1 = require('uuid/v1.js');
const xml = require('xml');
const builder = require('xmlbuilder');

module.exports.setOutXMLReturnedShoroAzyk = async(returned) => {
    let outXMLReturnedShoroAzyk = await OutXMLReturnedShoroAzyk
        .findOne({returned: returned._id})
    if(outXMLReturnedShoroAzyk){
        outXMLReturnedShoroAzyk.status = 'update'
        outXMLReturnedShoroAzyk.data = []
        for (let i = 0; i < returned.items.length; i++) {
            let guidItem = await Integrate1CAzyk
                .findOne({item: returned.items[i]._id})
            if(guidItem)
                outXMLReturnedShoroAzyk.data.push({
                    guid: guidItem.guid,
                    qt:  returned.items[i].count,
                    price: returned.items[i].price,
                    amount: returned.items[i].allPrice
                })
        }
        await outXMLReturnedShoroAzyk.save()
        await ReturnedAzyk.updateMany({_id: returned._id}, {sync: 1})
    }
    else {
        let guidClient = await Integrate1CAzyk
            .findOne({client: returned.client._id, organization: returned.organization._id})
        if(guidClient){
            let district = await DistrictAzyk
                .findOne({client: returned.client._id, organization: returned.organization._id})
            if(district) {
                let guidAgent = await Integrate1CAzyk
                    .findOne({agent: district.agent})
                let guidEcspeditor = await Integrate1CAzyk
                    .findOne({ecspeditor: district.ecspeditor})
                if (guidAgent && guidEcspeditor) {
                    let date = new Date()
                    if(date.getHours()>3)
                        date.setDate(date.getDate() + 1)
                    if(date.getDay()===0)
                        date.setDate(date.getDate() + 1)
                    let newOutXMLReturnedShoroAzyk = new OutXMLReturnedShoroAzyk({
                        data: [],
                        guid: await uuidv1(),
                        date: date,
                        number: returned.number,
                        client: guidClient.guid,
                        agent: guidAgent.guid,
                        forwarder: guidEcspeditor.guid,
                        returned: returned._id,
                        status: 'create'
                    });
                    for (let i = 0; i < returned.items.length; i++) {
                        let guidItem = await Integrate1CAzyk
                            .findOne({item: returned.items[i]._id})
                        if (guidItem)
                            newOutXMLReturnedShoroAzyk.data.push({
                                guid: guidItem.guid,
                                qt: returned.items[i].count,
                                price: returned.items[i].price,
                                amount: returned.items[i].allPrice
                            })
                    }
                    await OutXMLReturnedShoroAzyk.create(newOutXMLReturnedShoroAzyk);
                    await ReturnedAzyk.updateMany({_id: returned._id}, {sync: 1})
                }
            }
        }
    }
}

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
        await outXMLShoroAzyk.save()
        await InvoiceAzyk.updateMany({_id: invoice._id}, {sync: 1})
    }
    else {
        let guidClient = await Integrate1CAzyk
            .findOne({client: invoice.client._id, organization: invoice.orders[0].item.organization._id})
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
                    if(date.getHours()>3)
                        date.setDate(date.getDate() + 1)
                    if(date.getDay()===0)
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
                        status: 'create',
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

module.exports.setOutXMLShoroAzykLogic = async(invoices, forwarder, track) => {
    if(track!=undefined||forwarder) {
        let guidEcspeditor
        if(forwarder){
            guidEcspeditor = await Integrate1CAzyk
                .findOne({ecspeditor: forwarder})
        }
        await OutXMLShoroAzyk.updateMany(
            {invoice: {$in: invoices}},
            {
                status: 'update',
                ...(track!=undefined?{track: track}:{}),
                ...(guidEcspeditor?{forwarder: guidEcspeditor.guid}:{})
            })
        await InvoiceAzyk.updateMany({_id: {$in: invoices}}, {
            sync: 1,
            ...(track!=undefined?{track: track}:{}),
            ...(guidEcspeditor?{forwarder: forwarder}:{})
        })
    }
}

module.exports.setOutXMLReturnedShoroAzykLogic = async(returneds, forwarder, track) => {
    if(track!=undefined||forwarder) {
        let guidEcspeditor
        if(forwarder){
            guidEcspeditor = await Integrate1CAzyk
                .findOne({ecspeditor: forwarder})
        }
        await OutXMLReturnedShoroAzyk.updateMany(
            {returned: {$in: returneds}},
            {
                status: 'update',
                ...(track!=undefined?{track: track}:{}),
                ...(guidEcspeditor?{forwarder: guidEcspeditor.guid}:{})
            })
        await ReturnedAzyk.updateMany({_id: {$in: returneds}},{
            sync: 1,
            ...(track!=undefined?{track: track}:{}),
            ...(guidEcspeditor?{forwarder: forwarder}:{})
        })
    }
}

module.exports.cancelOutXMLReturnedShoroAzyk = async(returned) => {
    let outXMLReturnedShoroAzyk = await OutXMLReturnedShoroAzyk
        .findOne({returned: returned._id})
    if(outXMLReturnedShoroAzyk){
        outXMLReturnedShoroAzyk.status = 'del'
        await outXMLReturnedShoroAzyk.save()
    }
}

module.exports.cancelOutXMLShoroAzyk = async(invoice) => {
    let outXMLShoroAzyk = await OutXMLShoroAzyk
        .findOne({invoice: invoice._id})
    if(outXMLShoroAzyk){
        outXMLShoroAzyk.status = 'del'
        await outXMLShoroAzyk.save()
    }
}

module.exports.checkOutXMLShoroAzyk = async(guid, exc) => {
    let outXMLShoroAzyk = await OutXMLShoroAzyk
        .findOne({guid: guid})
    if(outXMLShoroAzyk){
        outXMLShoroAzyk.status =  exc?'error':'check'
        outXMLShoroAzyk.exc =  exc?exc:null
        await outXMLShoroAzyk.save()
        await InvoiceAzyk.updateMany({_id: outXMLShoroAzyk.invoice}, !exc?{sync: 2}:{})
    }
}

module.exports.checkOutXMLReturnedShoroAzyk = async(guid, exc) => {
    let outXMLReturnedShoroAzyk = await OutXMLReturnedShoroAzyk
        .findOne({guid: guid})
    if(outXMLReturnedShoroAzyk){
        outXMLReturnedShoroAzyk.status = exc?'error':'check'
        outXMLReturnedShoroAzyk.exc =  exc?exc:null
        await outXMLReturnedShoroAzyk.save()
        await ReturnedAzyk.updateMany({_id: outXMLReturnedShoroAzyk.returned}, !exc?{sync: 2}:{})
    }
}

module.exports.checkOutXMLClientShoroAzyk = async(guid, exc) => {
    let organization = await OrganizationAzyk
        .findOne({name: 'ЗАО «ШОРО»'})
    let guidClient = await Integrate1CAzyk
        .findOne({guid: guid, organization: organization._id})
    if (guidClient&&!exc) {
        let client = await ClientAzyk
            .findOne({_id: guidClient.client})
        client.sync.push('ЗАО «ШОРО»')
        await client.save()
    }
    else if (guidClient&&exc) {
        let object = new OutXMLClientShoroAzyk({
            guid: guidClient.guid,
            client: guidClient.client,
            exc: exc
        });
        await OutXMLClientShoroAzyk.create(object);
    }
}

module.exports.getOutXMLShoroAzyk = async() => {
    let result = builder.create('root').att('mode', 'sales');
    let outXMLShoros = await OutXMLShoroAzyk
        .find({$and: [{status: {$ne: 'check'}}, {status: {$ne: 'error'}}]})
        .populate({path: 'invoice'})
        .sort('date')
        //.limit(20)
    for(let i=0;i<outXMLShoros.length;i++){
        let item = result
            .ele('item')
        if(outXMLShoros[i].status==='del')
            item.att('del', '1')
        item.att('guid', outXMLShoros[i].guid)
        item.att('client', outXMLShoros[i].client)
        item.att('agent', outXMLShoros[i].agent)
        item.att('track', outXMLShoros[i].track?outXMLShoros[i].track:1)
        item.att('forwarder', outXMLShoros[i].forwarder)
        item.att('date', pdDDMMYYYY(outXMLShoros[i].date))
        item.att('coment', `${outXMLShoros[i].invoice.info} ${outXMLShoros[i].invoice.address[2]?`${outXMLShoros[i].invoice.address[2]}, `:''}${outXMLShoros[i].invoice.address[0]}`)

        for(let ii=0;ii<outXMLShoros[i].data.length;ii++){
            item.ele('product')
                .att('guid', outXMLShoros[i].data[ii].guid)
                .att('package', outXMLShoros[i].data[ii].package)
                .att('qty',  outXMLShoros[i].data[ii].qt)
                .att('price', outXMLShoros[i].data[ii].price)
                .att('amount', outXMLShoros[i].data[ii].amount)
        }
    }
    result = result.end({ pretty: true})
    return result
}

module.exports.getOutXMLClientShoroAzyk = async() => {
    let result = builder.create('root').att('mode', 'client');
    let organization = await OrganizationAzyk
        .findOne({name: 'ЗАО «ШОРО»'})
    let integrate1Cs =  await Integrate1CAzyk
        .find({
            client: {$ne: null},
            organization: organization._id
        })
        .distinct('client')
    let outXMLClientShoroAzyks =  await OutXMLClientShoroAzyk
        .find()
        .distinct('client')
    let outXMLShoros = await ClientAzyk
        .aggregate([
            { $lookup:
                {
                    from: UserAzyk.collection.collectionName,
                    let: { user: '$user' },
                    pipeline: [
                        { $match: {$expr:{$eq:['$$user', '$_id']}} },
                    ],
                    as: 'user'
                }
            },
            {
                $unwind:{
                    preserveNullAndEmptyArrays : true,
                    path : '$user'
                }
            },
            {
                $match:{
                    $and: [
                        {_id: {$nin: outXMLClientShoroAzyks}},
                        {_id: {$in: integrate1Cs}}
                    ],
                    sync: {$ne: 'ЗАО «ШОРО»'},
                    'user.status': 'active',
                    del: {$ne: 'deleted'}
                }
            },
            { $limit : 100 },
        ])
    for(let i=0;i<outXMLShoros.length;i++){
        let guidClient = await Integrate1CAzyk
            .findOne({client: outXMLShoros[i]._id, organization: organization._id})
        if(guidClient){
            let district = await DistrictAzyk
                .findOne({client: outXMLShoros[i]._id, organization: organization._id})
            let agent;
            if(district&&district.agent){
                agent= await Integrate1CAzyk
                    .findOne({agent: district.agent, organization: organization._id})
            }
            let item = result
                .ele('item')
            item.att('guid', guidClient.guid)
            item.att('name', outXMLShoros[i].address[0][2])
            item.att('address', outXMLShoros[i].address[0][0])
            item.att('tel', outXMLShoros[i].phone)
            if(agent)
                item.att('agent', agent.guid)
        }
    }
    result = result.end({ pretty: true})
    return result
}

module.exports.getOutXMLReturnedShoroAzyk = async() => {
    let result = builder.create('root').att('mode', 'returned');
    let outXMLReturnedShoros = await OutXMLReturnedShoroAzyk
        .find({$and: [{status: {$ne: 'check'}}, {status: {$ne: 'error'}}]})
        .populate({path: 'returned'})
        .sort('date')
        //.limit(20)
    for(let i=0;i<outXMLReturnedShoros.length;i++){
        let item = result
            .ele('item')
        if(outXMLReturnedShoros[i].status==='del')
            item.att('del', '1')
        item.att('guid', outXMLReturnedShoros[i].guid)
        item.att('client', outXMLReturnedShoros[i].client)
        item.att('agent', outXMLReturnedShoros[i].agent)
        item.att('forwarder', outXMLReturnedShoros[i].forwarder)
        item.att('date', pdDDMMYYYY(outXMLReturnedShoros[i].date))
        item.att('track', outXMLReturnedShoros[i].track?outXMLReturnedShoros[i].track:1)
        item.att('coment', `${outXMLReturnedShoros[i].returned.info} ${outXMLReturnedShoros[i].returned.address[2]?`${outXMLReturnedShoros[i].returned.address[2]}, `:''}${outXMLReturnedShoros[i].returned.address[0]}`)
        for(let ii=0;ii<outXMLReturnedShoros[i].data.length;ii++){
            item.ele('product')
                .att('guid', outXMLReturnedShoros[i].data[ii].guid)
                .att('qty',  outXMLReturnedShoros[i].data[ii].qt)
                .att('price', outXMLReturnedShoros[i].data[ii].price)
                .att('amount', outXMLReturnedShoros[i].data[ii].amount)
        }
    }
    result = result.end({ pretty: true})
    return result
}

module.exports.reductionOutXMLShoroAzyk = async() => {
    //lol
}