const ClientAzyk = require('../models/clientAzyk');
const UserAzyk = require('../models/userAzyk');
const OrderAzyk = require('../models/orderAzyk');
const ItemAzyk = require('../models/itemAzyk');
const { saveFile, deleteFile, urlMain } = require('../module/const');
const { createJwtGQL } = require('../module/passport');
const mongoose = require('mongoose')

const type = `
  type Client {
    _id: ID
    image: String
    name: String
    createdAt: Date
    birthday: Date
    email: String
    city: String
    address: [[String]]
    phone: [String]
    info: String
    reiting: Int
    user: Status
    type: String
    patent: String
    passport: String
    certificate: String
    organization: Organization
  }
`;

const query = `
    clients(search: String!, sort: String!, filter: String!): [Client]
    client(_id: ID!): Client
    sortClient: [Sort]
    filterClient: [Filter]
`;

const mutation = `
    addClient(image: Upload, name: String!, birthday: Date, email: String, city: String!, address: [[String]]!, phone: [String]!, info: String, type: String, patent: Upload, passport: Upload, certificate: Upload): Data
    setClient(_id: ID!, birthday: Date, image: Upload, patent: Upload, passport: Upload, certificate: Upload, name: String, type: String, city: String, phone: [String], login: String, email: String, address: [[String]], info: String, newPass: String): Data
    deleteClient(_id: [ID]!): Data
    onoffClient(_id: [ID]!): Data
`;

const resolvers = {
    clients: async(parent, {search, sort, filter}, {user}) => {
        if(user.role==='admin'){
            let clients = await ClientAzyk
                .find({del: {$ne: 'deleted'}})
                .populate({ path: 'user', match: {status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter} })
                .populate({ path: 'organization' })
                .sort(sort)
            clients = clients.filter(
                client =>
                    (client.user||client.organization)&&(
                        ((client.phone.filter(phone => phone.toLowerCase()).includes(search.toLowerCase())).length > 0) ||
                        (client.name.toLowerCase()).includes(search.toLowerCase())||
                        (client.email.toLowerCase()).includes(search.toLowerCase())||
                        (client.city&&(client.city.toLowerCase()).includes(search.toLowerCase()))||
                        (client.type.toLowerCase()).includes(search.toLowerCase())||
                        ((client.address.filter(addres=>addres[0].toLowerCase()).includes(search.toLowerCase())).length>0)||
                        (client.info.toLowerCase()).includes(search.toLowerCase())||
                        (client.organization&&client.organization.name.toLowerCase().includes(search.toLowerCase()))
                    )
            )
            return clients
        } else if(['организация', 'менеджер', 'агент'].includes(user.role)) {
            let items = await ItemAzyk.find({organization: user.organization}).distinct('_id')
            let clients = await OrderAzyk.find({item: {$in: items}}).distinct('client')
            clients = await ClientAzyk.find({$or: [{_id: {$in: clients}}, {organization: user.organization}], del: {$ne: 'deleted'}}).populate({ path: 'user', match: {status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter} }).populate({ path: 'organization' }).sort(sort)
            clients = clients.filter(
                client => {
                    return (client.user || client.organization) && (
                        ((client.phone.filter(phone => phone.toLowerCase()).includes(search.toLowerCase())).length > 0) ||
                        (client.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (client.email.toLowerCase()).includes(search.toLowerCase()) ||
                        (client.city && (client.city.toLowerCase()).includes(search.toLowerCase())) ||
                        ((client.address.filter(addres => addres[0].toLowerCase()).includes(search.toLowerCase())).length > 0) ||
                        (client.type.toLowerCase()).includes(search.toLowerCase()) ||
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
                    name: 'Дата',
                    field: 'createdAt'
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
    addClient: async(parent, {image, name, birthday, email, city, address, phone, info, type, patent, passport, certificate}, {user}) => {
        if(['организация', 'менеджер', 'агент'].includes(user.role)) {
            let client = {organization: user.organization}
            if(name)client.name = name
            if(birthday)client.birthday = birthday
            if(email)client.email = email
            if(city)client.city = city
            if(address)client.address = address
            if(phone)client.phone = phone
            if(info)client.info = info
            if(type)client.type = type
            console.log(2)
            if (image) {
                console.log(3)
                let {stream, filename} = await image;
                console.log(4)
                filename = await saveFile(stream, filename)
                console.log(5)
                client.image = urlMain + filename
                console.log(6)
            }
            console.log(7)
            if (patent) {
                let {stream, filename} = await patent;
                filename = await saveFile(stream, filename)
                client.patent = urlMain + filename
            }
            if (passport) {
                let {stream, filename} = await passport;
                filename = await saveFile(stream, filename)
                client.passport = urlMain + filename
            }
            if (certificate) {
                let {stream, filename} = await certificate;
                filename = await saveFile(stream, filename)
                client.certificate = urlMain + filename
            }
            client = new ClientAzyk(client);
            await ClientAzyk.create(client);
        }
        return {data: 'OK'}
    },
    setClient: async(parent, {_id, type, image, name, email, address, info, newPass, phone, login, birthday, city, patent, passport, certificate}, {user, res}) => {
        let object = await ClientAzyk.findOne({_id: _id})
        if(
            user.role==='admin'||
            object.user&&object.user.toString()===user._id.toString()||
            (object.organization&&(user.organization.toString()===object.organization.toString())&&['организация', 'менеджер', 'агент'].includes(user.role))) {
            if (image) {
                let {stream, filename} = await image;
                if(object.image&&object.image.includes(urlMain))
                    await deleteFile(object.image)
                filename = await saveFile(stream, filename)
                object.image = urlMain + filename
            }
            if (patent) {
                let {stream, filename} = await patent;
                if(object.patent&&object.patent.includes(urlMain))
                    await deleteFile(object.patent)
                filename = await saveFile(stream, filename)
                object.patent = urlMain + filename
            }
            if (passport) {
                let {stream, filename} = await passport;
                if(object.passport&&object.passport.includes(urlMain))
                    await deleteFile(object.passport)
                filename = await saveFile(stream, filename)
                object.passport = urlMain + filename
            }
            if (certificate) {
                let {stream, filename} = await certificate;
                if(object.certificate&&object.certificate.includes(urlMain))
                    await deleteFile(object.certificate)
                filename = await saveFile(stream, filename)
                object.certificate = urlMain + filename
            }
            if(name) object.name = name
            if(email) object.email = email
            if(address) object.address = address
            if(info) object.info = info
            if(birthday) object.birthday = birthday
            if(city) object.city = city
            if(type) object.type = type
            if(phone) object.phone = phone

            if(newPass||login){
                let objectUser = await UserAzyk.findById(object.user)
                if(newPass)objectUser.password = newPass
                if(login)objectUser.login = login
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
                ||
                ((objects[i].organization&&user.organization.toString()===objects[i].organization.toString())&&['организация', 'менеджер', 'агент'].includes(user.role))
            ){
                if(objects[i].image)
                    await deleteFile(objects[i].image)
                objects[i].del = 'deleted'
                objects[i].save
                //await UserAzyk.delete({_id: objects.user._id})
            }
        }
        return {data: 'OK'}
    },
    onoffClient: async(parent, { _id }, {user}) => {
        let objects = await ClientAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(
                user.role==='admin'
                ||
                ((objects[i].organization&&user.organization.toString()===objects[i].organization.toString())&&['организация', 'менеджер', 'агент'].includes(user.role))
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