const ClientAzyk = require('../models/clientAzyk');

module.exports.reductionToClient = async() => {
    let clients = await ClientAzyk.find({$or: [{city: null}, {type: null}]})
    console.log(`reductionToClient: ${clients.length}`)
    for(let i = 0; i<clients.length;i++){
        clients[i].city = ''
        clients[i].type = ''
        clients[i].save();
    }
}