const ClientAzyk = require('../models/clientAzyk');
const UserAzyk = require('../models/userAzyk');
const OrderAzyk = require('../models/orderAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const ItemAzyk = require('../models/itemAzyk');
const { saveFile, deleteFile, urlMain } = require('../module/const');
const { createJwtGQL } = require('../module/passport');

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
  }
`;

const query = `
    clients(search: String!, sort: String!, filter: String!): [Client]
    client(_id: ID!): Client
    sortClient: [Sort]
    filterClient: [Filter]
`;

const mutation = `
    setClient(_id: ID!, birthday: Date, image: Upload, patent: Upload, passport: Upload, certificate: Upload, name: String, type: String, city: String, phone: [String], login: String, email: String, address: [[String]], info: String, newPass: String): Data
    deleteClient(_id: [ID]!): Data
    onoffClient(_id: [ID]!): Data
`;

const resolvers = {
    clients: async(parent, {search, sort, filter}, {user}) => {
        if(user.role==='admin'){
            let clients = await ClientAzyk
                .find({})
                .populate({ path: 'user', match: {status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter} })
                .populate({ path: 'organization' })
                .sort(sort)
            clients = clients.filter(
                client =>
                    client.user&&(
                        ((client.phone.filter(phone => phone.toLowerCase()).includes(search.toLowerCase())).length > 0) ||
                        (client.user.status.toLowerCase()).includes(search.toLowerCase())||
                        (client.name.toLowerCase()).includes(search.toLowerCase())||
                        (client.email.toLowerCase()).includes(search.toLowerCase())||
                        (client.city&&(client.city.toLowerCase()).includes(search.toLowerCase()))||
                        (client.type.toLowerCase()).includes(search.toLowerCase())||
                        ((client.address.filter(addres=>addres[0].toLowerCase()).includes(search.toLowerCase())).length>0)||
                        (client.info.toLowerCase()).includes(search.toLowerCase())
                    )
            )
            return clients
        } else if(['организация', 'менеджер', 'агент'].includes(user.role)) {
            let items = await ItemAzyk.find({organization: user.organization}).distinct('_id')
            let clients = await OrderAzyk.find({item: {$in: items}}).distinct('client')
            clients = await ClientAzyk.find().populate({ path: 'user', match: {status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter} }).sort(sort)
           clients = clients.filter(client => client.user)
            clients = clients.filter(
                    client =>
                        client.user && (
                            ((client.phone.filter(phone => phone.toLowerCase()).includes(search.toLowerCase())).length > 0) ||
                            (client.user.status.toLowerCase()).includes(search.toLowerCase()) ||
                            (client.name.toLowerCase()).includes(search.toLowerCase()) ||
                            (client.email.toLowerCase()).includes(search.toLowerCase()) ||
                            (client.city&&(client.city.toLowerCase()).includes(search.toLowerCase())) ||
                            ((client.address.filter(addres => addres[0].toLowerCase()).includes(search.toLowerCase())).length > 0) ||
                            (client.type.toLowerCase()).includes(search.toLowerCase()) ||
                            (client.info.toLowerCase()).includes(search.toLowerCase())
                        )
                )
            return clients
        }
    },
    client: async(parent, {_id}) => {
        return await ClientAzyk.findOne({
                user: _id
            }).populate({ path: 'user'})
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
    setClient: async(parent, {_id, type, image, name, email, address, info, newPass, phone, login, birthday, city, patent, passport, certificate}, {user, res}) => {
        if(user.role==='admin'||_id.toString()===user._id.toString()) {
            let object = await ClientAzyk.findOne({user: _id})
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveFile(stream, filename)
                object.image = urlMain + filename
            }
            if (patent) {
                let {stream, filename} = await patent;
                if(object.patent)
                    await deleteFile(object.patent)
                filename = await saveFile(stream, filename)
                object.patent = urlMain + filename
            }
            if (passport) {
                let {stream, filename} = await passport;
                if(object.passport)
                    await deleteFile(object.passport)
                filename = await saveFile(stream, filename)
                object.passport = urlMain + filename
            }
            if (certificate) {
                let {stream, filename} = await certificate;
                if(object.certificate)
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
        if(user.role==='admin'){
            let objects = await ClientAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                await deleteFile(objects[i].image)
                await UserAzyk.delete({_id: objects.user._id})
            }
            await ClientAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    },
    onoffClient: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await ClientAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
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