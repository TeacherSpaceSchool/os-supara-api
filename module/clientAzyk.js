const ClientAzyk = require('../models/clientAzyk');
const SubscriberAzyk = require('../models/subscriberAzyk');

module.exports.reductionToClient = async() => {
    let clients = await ClientAzyk.find({$or: [{city: null}, {notification: null}]})
    console.log(`reductionToClient: ${clients.length}`)
    for(let i = 0; i<clients.length;i++){
        if(clients[i].city===null)clients[i].city = ''
        if(clients[i].notification===null)clients[i].notification = (await SubscriberAzyk.find({user: clients[i].user})).length>0
        clients[i].save();
    }
}