const ClientAzyk = require('../models/clientAzyk');
const UserAzyk = require('../models/userAzyk');
const OrderAzyk = require('../models/orderAzyk');
const ItemAzyk = require('../models/itemAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const { saveFile, deleteFile, urlMain, saveImage } = require('../module/const');
const { createJwtGQL } = require('../module/passport');
const mongoose = require('mongoose')

const type = `
  type Client {
    _id: ID
    image: String
    name: String
    createdAt: Date
    lastActive: Date
    email: String
    city: String
    address: [[String]]
    phone: [String]
    info: String
    reiting: Int
    user: Status
    device: String
    organization: Organization
    notification: Boolean
  }
`;

const query = `
    clients(search: String!, sort: String!, filter: String!, date: String): [Client]
    client(_id: ID!): Client
    sortClient: [Sort]
    filterClient: [Filter]
`;

const mutation = `
    addClient(image: Upload, name: String!, email: String, city: String!, address: [[String]]!, phone: [String]!, info: String, password: String!, login: String!): Data
    setClient(_id: ID!, device: String, image: Upload, name: String, city: String, phone: [String], login: String, email: String, address: [[String]], info: String, newPass: String): Data
    deleteClient(_id: [ID]!): Data
    onoffClient(_id: [ID]!): Data
`;

const resolvers = {
    clients: async(parent, {search, sort, filter, date}, {user}) => {
        let dateStart;
        let dateEnd;
        if(date&&date!==''){
            dateStart = new Date(date)
            dateEnd = new Date(dateStart)
            dateEnd = dateEnd.setDate(dateEnd.getDate() + 1)
        }
        if(user.role==='admin'){
            let clients = await ClientAzyk
                .find({
                    ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                    del: {$ne: 'deleted'}
                })
                .populate({ path: 'user', match: {status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter} })
                .sort(sort)
            clients = clients.filter(
                client =>
                    (client.user)&&(
                        ((client.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        (client.name.toLowerCase()).includes(search.toLowerCase())||
                        (client.email.toLowerCase()).includes(search.toLowerCase())||
                        (client.city&&(client.city.toLowerCase()).includes(search.toLowerCase()))||
                        ((client.address.filter(addres=>addres[0].toLowerCase().includes(search.toLowerCase()))).length>0)||
                        ((client.address.filter(addres=>(addres[2]?addres[2]:'').toLowerCase().includes(search.toLowerCase()))).length>0)||
                        (client.info.toLowerCase()).includes(search.toLowerCase())||
                        client.device&&(client.device.toLowerCase()).includes(search.toLowerCase())
                    )
            )
            return clients
        }
        else if('агент'===user.role) {
            let clients = await DistrictAzyk
                .find({agent: user.employment})
                .distinct('client')
            clients = await ClientAzyk.find({
                ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                _id: {$in: clients}, del: {$ne: 'deleted'}})
                .populate({ path: 'user', match: {status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter} })
                .sort(sort)
            clients = clients.filter(
                client => {
                    return (client.user) && (
                        ((client.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        (client.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (client.email.toLowerCase()).includes(search.toLowerCase()) ||
                        (client.city && (client.city.toLowerCase()).includes(search.toLowerCase())) ||
                        ((client.address.filter(addres => addres[0].toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        ((client.address.filter(addres=>(addres[2]?addres[2]:'').toLowerCase().includes(search.toLowerCase()))).length>0)||
                        (client.info.toLowerCase()).includes(search.toLowerCase())
                    )
                }
            )
            return clients
        }
        else if('менеджер'===user.role) {
            let clients = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('client')
            clients = await ClientAzyk.find({
                ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                _id: {$in: clients}, del: {$ne: 'deleted'}})
                .populate({ path: 'user', match: {status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter} })
                .sort(sort)
            clients = clients.filter(
                client => {
                    return (client.user) && (
                        ((client.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        (client.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (client.email.toLowerCase()).includes(search.toLowerCase()) ||
                        (client.city && (client.city.toLowerCase()).includes(search.toLowerCase())) ||
                        ((client.address.filter(addres => addres[0].toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        ((client.address.filter(addres=>(addres[2]?addres[2]:'').toLowerCase().includes(search.toLowerCase()))).length>0)||
                        (client.info.toLowerCase()).includes(search.toLowerCase())
                    )
                }
            )
            return clients
        } else if(['организация'].includes(user.role)) {
            let organization = await OrganizationAzyk.findOne({_id: user.organization})
            let clients;
            if(organization.accessToClient)
                clients = await ClientAzyk
                    .find({
                        ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                        del: {$ne: 'deleted'}
                    })
                    .populate({
                        path: 'user',
                        match: {status: 'active'}
                    })
                    .sort(sort)
            else {
                let items = await ItemAzyk.find({organization: user.organization}).distinct('_id')
                clients = await OrderAzyk.find({item: {$in: items}}).distinct('client')
                clients = await ClientAzyk.find({
                    ...(!date||date===''?{}:{ $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}]}),
                    _id: {$in: clients},
                    del: {$ne: 'deleted'}
                }).populate({
                    path: 'user',
                    match: {status: 'active'}
                })
                    .sort(sort)
            }
            clients = clients.filter(
                client => {
                    return (client.user) && (
                        ((client.phone.filter(phone => phone.toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        (client.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (client.email.toLowerCase()).includes(search.toLowerCase()) ||
                        (client.city && (client.city.toLowerCase()).includes(search.toLowerCase())) ||
                        ((client.address.filter(addres => addres[0].toLowerCase().includes(search.toLowerCase()))).length > 0) ||
                        ((client.address.filter(addres=>(addres[2]?addres[2]:'').toLowerCase().includes(search.toLowerCase()))).length>0)||
                        (client.info.toLowerCase()).includes(search.toLowerCase())
                    )
                }
            )
            return clients
        }
    },
    client: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id))
            return await ClientAzyk.findOne({
                $or:[
                    {_id: _id},
                    {user: _id}
                ]
            }).populate({ path: 'user'})
        else return null
    },
    sortClient: async(parent, ctx, {user}) => {
        let sort = [
        ]
        if(['организация', 'менеджер', 'admin'].includes(user.role)) {
            sort = [
                {
                    name: 'Имя',
                    field: 'name'
                },
                {
                    name: 'Регистрация',
                    field: 'createdAt'
                },
                {
                    name: 'Активность',
                    field: 'lastActive'
                },
                {
                    name: 'Уведомления',
                    field: 'notification'
                },
                {
                    name: 'Устройства',
                    field: 'device'
                }
            ]
        }
        return sort
    },
    filterClient: async(parent, ctx, {user}) => {
        if(['организация', 'менеджер', 'admin'].includes(user.role))
            return await [
                {
                    name: 'Все',
                    value: ''
                },
                {
                    name: 'Активные',
                    value: 'active'
                },
                {
                    name: 'Неактивные',
                    value: 'deactive'
                }
            ]
        else
            return await []
    },
};

const resolversMutation = {
    addClient: async(parent, {image, name, email, city, address, phone, info, login, password}, {user}) => {
        if(['admin'].includes(user.role)) {
            let newUser = new UserAzyk({
                login: login.trim(),
                role: 'client',
                status: 'active',
                password: password,
            });
            newUser = await UserAzyk.create(newUser);
            let client = {status: 'active', user: newUser._id}
            if(name)client.name = name
            if(email)client.email = email
            if(city)client.city = city
            if(address)client.address = address
            if(phone)client.phone = phone
            if(info)client.info = info
            if (image) {
                let {stream, filename} = await image;
                filename = await saveImage(stream, filename)
                client.image = urlMain + filename
            }
            client.notification=false
            client = new ClientAzyk(client);
            await ClientAzyk.create(client);
        }
        return {data: 'OK'}
    },
    setClient: async(parent, {_id, image, name, email, address, info, newPass, phone, login, city, device}, {user, res}) => {
        let object = await ClientAzyk.findOne({_id: _id})
        if(
            user.role==='admin'||
            object.user&&object.user.toString()===user._id.toString()
        ) {
            if (image) {
                let {stream, filename} = await image;
                if(object.image&&object.image.includes(urlMain))
                    await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(name) object.name = name
            if(email) object.email = email
            if(address) object.address = address
            if(info) object.info = info
            if(city) object.city = city
            if(phone) object.phone = phone
            if(device) object.device = device

            if(newPass||login){
                let objectUser = await UserAzyk.findById(object.user)
                if(newPass)objectUser.password = newPass
                if(login)objectUser.login = login.trim()
                objectUser.save()
                if(objectUser._id.toString()===user._id.toString())
                    await createJwtGQL(res, objectUser)
            }

            object.save();
        }
        return {data: 'OK'}
    },
    deleteClient: async(parent, { _id }, {user}) => {
        let objects = await ClientAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(
                user.role==='admin'
            ){
                if(objects[i].image)
                    await deleteFile(objects[i].image)
                if(objects[i].user) {
                    let object = await UserAzyk.findOne({_id: objects[i].user})
                    object.status = object.status === 'active' ? 'deactive' : 'active'
                    await object.save()
                }
                objects[i].del = 'deleted'
                objects[i].save()
                await Integrate1CAzyk.deleteMany({client: objects[i]._id})
            }
        }
        return {data: 'OK'}
    },
    onoffClient: async(parent, { _id }, {user}) => {
        let objects = await ClientAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(
                user.role==='admin'
            ){
                let object = await UserAzyk.findOne({_id: objects[i].user})
                object.status = object.status==='active'?'deactive':'active'
                await object.save()
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