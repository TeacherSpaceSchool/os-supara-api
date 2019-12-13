const mongoose = require('mongoose');
const OrganizationAzyk = require('../models/organizationAzyk');
const BonusAzyk = require('../models/bonusAzyk');
const BonusClientAzyk = require('../models/bonusClientAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const ItemAzyk = require('../models/itemAzyk');
const BasketAzyk = require('../models/basketAzyk');
const { saveFile, deleteFile, urlMain } = require('../module/const');

const type = `
  type Organization {
    _id: ID
    createdAt: Date
    name: String
    address: [String]
    email: [String]
    phone: [String]
    info: String
    reiting: Int
    status: String
    image: String
    minimumOrder: Int
  }
`;

const query = `
    organizations(search: String!, sort: String!, filter: String!): [Organization]
    organization(_id: ID!): Organization
    sortOrganization: [Sort]
    filterOrganization: [Filter]
`;

const mutation = `
    addOrganization(minimumOrder: Int, image: Upload!, name: String!, address: [String]!, email: [String]!, phone: [String]!, info: String!): Data
    setOrganization(_id: ID!, minimumOrder: Int, image: Upload, name: String, address: [String], email: [String], phone: [String], info: String): Data
    deleteOrganization(_id: [ID]!): Data
    onoffOrganization(_id: [ID]!): Data
`;

const resolvers = {
    organizations: async(parent, {search, sort, filter}, {user}) => {
        if(user.role==='admin'){
            return await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'},
                status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter,
                del: {$ne: 'deleted'}
            }).sort(sort)
        } else
            return await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'},
                status: 'active',
                del: {$ne: 'deleted'}
            }).sort(sort)
    },
    organization: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id))
            return await OrganizationAzyk.findOne({
                    _id: _id
                })
    },
    sortOrganization: async(parent, ctx, {user}) => {
        let sort = [
            {
                name: 'Имя',
                field: 'name'
            }
        ]
        if(user.role==='admin') {
            sort = [
                ...sort,
                {
                    name: 'Статус',
                    field: 'status'
                }
            ]
        }
        return sort
    },
    filterOrganization: async(parent, ctx, {user}) => {
        if(user.role==='admin')
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
    addOrganization: async(parent, {info, phone, email, address, image, name, minimumOrder}, {user}) => {
        if(user.role==='admin'){
            let { stream, filename } = await image;
            filename = await saveFile(stream, filename)
            let objectOrganization = new OrganizationAzyk({
                image: urlMain+filename,
                name: name,
                status: 'active',
                address: address,
                email: email,
                phone: phone,
                info: info,
                minimumOrder: minimumOrder,
                reiting: 0,
            });
            objectOrganization = await OrganizationAzyk.create(objectOrganization)
            let objectBonus = new BonusAzyk({
                target: 0,
                bonus: 0,
                organization: objectOrganization._id
            });
            await BonusAzyk.create(objectBonus)
        }
        return {data: 'OK'};
    },
    setOrganization: async(parent, {_id, info, phone, email, address, image, name, minimumOrder}, {user}) => {
        if(user.role==='admin'||(user.role==='организация'&&user.organization.toString()===_id.toString())) {
            let object = await OrganizationAzyk.findById(_id)
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveFile(stream, filename)
                object.image = urlMain + filename
            }
            if(name) object.name = name
            if(info) object.info = info
            if(phone) object.phone = phone
            if(email) object.email = email
            if(address) object.address = address
            if(minimumOrder) object.minimumOrder = minimumOrder
            object.save();
        }
        return {data: 'OK'}
    },
    deleteOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let items = await ItemAzyk.find({organization: {$in: _id}})
            items = items.map(element=>element._id)
            await BasketAzyk.deleteMany({item: {$in: items}})
            await ItemAzyk.updateMany({organization: {$in: _id}}, {status: 'deactive'})
            await EmploymentAzyk.deleteMany({organization: {$in: _id}})
            let bonus = await BonusAzyk.find({organization: {$in: _id}});
            bonus = bonus.map(element=>element._id)
            await BonusClientAzyk.deleteMany({bonus: {$in: bonus}})
            await BonusAzyk.deleteMany({organization: {$in: _id}})
            await OrganizationAzyk.updateMany({_id: {$in: _id}}, {del: 'deleted'})
        }
        return {data: 'OK'}
    },
    onoffOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await OrganizationAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                objects[i].save()
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