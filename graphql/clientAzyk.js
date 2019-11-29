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
    updatedAt: Date
    email: String
    address: [[String]]
    info: String,
    reiting: Int,
    user: Status,
  }
`;

const query = `
    clients(search: String!, sort: String!, filter: String!): [Client]
    client(_id: ID!): Client
    sortClient: [Sort]
    filterClient: [Filter]
`;

const mutation = `
    setClient(_id: ID!, image: Upload, name: String, phone: String, email: String, address: [[String]], info: String, newPass: String): Data
    deleteClient(_id: [ID]!): Data
    onoffClient(_id: [ID]!): Data
`;

const resolvers = {
    clients: async(parent, {search, sort, filter}, {user}) => {
        if(user.role==='admin'){
            let clients = await ClientAzyk.find({}).populate({ path: 'user', match: {status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter} }).sort(sort)
            clients = clients.filter(
                client =>
                    client.user&&(
                        (client.user.phone.toLowerCase()).includes(search.toLowerCase())||
                        (client.user.status.toLowerCase()).includes(search.toLowerCase())||
                        (client.name.toLowerCase()).includes(search.toLowerCase())||
                        (client.email.toLowerCase()).includes(search.toLowerCase())||
                        ((client.address.filter(address=>address.toLowerCase()).includes(search.toLowerCase())).length>0)||
                        (client.info.toLowerCase()).includes(search.toLowerCase())
                    )
            )
            return clients
        } else if(['организация', 'менеджер'].includes(user.role)) {
            let items = await ItemAzyk.find({organization: user.organization}).distinct('_id')
            let clients = await OrderAzyk.find({item: {$in: items}}).distinct('client')
            clients = await ClientAzyk.find().populate({ path: 'user', match: {status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter} }).sort(sort)
            clients = clients.filter(client => client.user)
            clients = clients.filter(
                client =>
                    client.user&&(
                        (client.user.phone.toLowerCase()).includes(search.toLowerCase())||
                        (client.user.status.toLowerCase()).includes(search.toLowerCase())||
                        (client.name.toLowerCase()).includes(search.toLowerCase())||
                        (client.email.toLowerCase()).includes(search.toLowerCase())||
                        ((client.address.filter(address=>address.toLowerCase()).includes(search.toLowerCase())).length>0)||
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
                    field: 'updatedAt'
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
    setClient: async(parent, {_id, image, name, email, address, info, newPass, phone}, {user, res}) => {
        if(user.role==='admin'||_id.toString()===user._id.toString()) {
            let object = await ClientAzyk.findOne({user: _id})
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveFile(stream, filename)
                object.image = urlMain + filename
            }
            if(name) object.name = name
            if(email) object.email = email
            if(address) object.address = address
            if(info) object.info = info

            if(newPass||phone){
                let objectUser = await UserAzyk.findById(object.user)
                if(newPass)objectUser.password = newPass
                if(phone)objectUser.phone = phone
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