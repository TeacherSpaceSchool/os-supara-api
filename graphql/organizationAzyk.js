const mongoose = require('mongoose');
const OrganizationAzyk = require('../models/organizationAzyk');
const BonusAzyk = require('../models/bonusAzyk');
const AutoAzyk = require('../models/autoAzyk');
const EquipmentAzyk = require('../models/equipmentAzyk');
const BonusClientAzyk = require('../models/bonusClientAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const DistributerAzyk = require('../models/distributerAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const AgentRouteAzyk = require('../models/agentRouteAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const ItemAzyk = require('../models/itemAzyk');
const BasketAzyk = require('../models/basketAzyk');
const UserAzyk = require('../models/userAzyk');
const AdsAzyk = require('../models/adsAzyk');
const PlanAzyk = require('../models/planAzyk');
const { saveImage, deleteFile, urlMain } = require('../module/const');

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
    accessToClient: Boolean
    consignation: Boolean
    del: String
    priotiry: Int
  }
`;

const query = `
    organizations(search: String!, sort: String!, filter: String!): [Organization]
    organizationsTrash(search: String!): [Organization]
    organization(_id: ID!): Organization
    sortOrganization: [Sort]
    filterOrganization: [Filter]
`;

const mutation = `
    addOrganization(priotiry: Int, minimumOrder: Int, image: Upload!, name: String!, address: [String]!, email: [String]!, phone: [String]!, info: String!, accessToClient: Boolean!, consignation: Boolean!): Data
    setOrganization(_id: ID!, priotiry: Int, minimumOrder: Int, image: Upload, name: String, address: [String], email: [String], phone: [String], info: String, accessToClient: Boolean, consignation: Boolean): Data
    restoreOrganization(_id: [ID]!): Data
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
            })
                .sort('-priotiry')
                .sort(sort)
        } else
            return await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'},
                status: 'active',
                del: {$ne: 'deleted'}
            })
                .sort('-priotiry')
                .sort(sort)
    },
    organizationsTrash: async(parent, {search}, {user}) => {
        if(user.role==='admin'){
            return await OrganizationAzyk.find({
                name: {'$regex': search, '$options': 'i'},
                del: 'deleted'
            })
                .sort('-createdAt')
        }
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
    addOrganization: async(parent, {priotiry, info, phone, email, address, image, name, minimumOrder, accessToClient, consignation}, {user}) => {
        if(user.role==='admin'){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
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
                accessToClient: accessToClient,
                consignation: consignation,
                priotiry: priotiry
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
    setOrganization: async(parent, {_id, priotiry, info, phone, email, address, image, name, minimumOrder, accessToClient, consignation}, {user}) => {
        if(user.role==='admin'||(['суперорганизация', 'организация'].includes(user.role)&&user.organization.toString()===_id.toString())) {
            let object = await OrganizationAzyk.findById(_id)
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(name) object.name = name
            if(info) object.info = info
            if(phone) object.phone = phone
            if(email) object.email = email
            if(address) object.address = address
            if(priotiry!=undefined) object.priotiry = priotiry
            if(consignation!=undefined) object.consignation = consignation
            if(accessToClient!=undefined) object.accessToClient = accessToClient
            if(minimumOrder!=undefined) object.minimumOrder = minimumOrder
            await object.save();
        }
        return {data: 'OK'}
    },
    restoreOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            await OrganizationAzyk.updateMany({_id: {$in: _id}}, {del: null, status: 'active'})
        }
        return {data: 'OK'}
    },
    deleteOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let items = await ItemAzyk.find({organization: {$in: _id}})
            items = items.map(element=>element._id)
            await BasketAzyk.deleteMany({item: {$in: items}})
            await ItemAzyk.updateMany({organization: {$in: _id}}, {del: 'deleted', status: 'deactive'})
            let users = await EmploymentAzyk.find({organization: {$in: _id}}).distinct('user')
            await UserAzyk.updateMany({_id: {$in: users}}, {status: 'deactive'})
            await EmploymentAzyk.updateMany({organization: {$in: _id}}, {del: 'deleted'})
            await Integrate1CAzyk.deleteMany({organization: {$in: _id}})
            await AgentRouteAzyk.deleteMany({organization: {$in: _id}})
            await DistrictAzyk.deleteMany({organization: {$in: _id}})
            await DistributerAzyk.deleteMany({distributer: {$in: _id}})
            let distributers = await DistributerAzyk.findOne({
                organizations: _id
            })
            for(let i=0; i<distributers.length; i++){
                for(let i1=0; i1<_id.length; i1++) {
                    distributers[i].organizations.splice(_id[i1], 1)
                }
                await distributers[i].save()
            }
            let bonus = await BonusAzyk.find({organization: {$in: _id}});
            bonus = bonus.map(element=>element._id)
            await BonusClientAzyk.deleteMany({bonus: {$in: bonus}})
            await BonusAzyk.deleteMany({organization: {$in: _id}})
            await AutoAzyk.deleteMany({organization: {$in: _id}})
            await EquipmentAzyk.deleteMany({organization: {$in: _id}})
            await OrganizationAzyk.updateMany({_id: {$in: _id}}, {del: 'deleted', status: 'deactive'})
            await AdsAzyk.updateMany({organization: {$in: _id}}, {del: 'deleted'})
            await PlanAzyk.deleteMany({organization: {$in: _id}})
        }
        return {data: 'OK'}
    },
    onoffOrganization: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await OrganizationAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                await EmploymentAzyk.updateMany({organization: objects[i]._id}, {status: objects[i].status})
                let items = await ItemAzyk.find({organization: objects[i]._id})
                items = items.map(element=>element._id)
                await BasketAzyk.deleteMany({item: {$in: items}})
                await ItemAzyk.updateMany({organization: objects[i]._id}, {status: objects[i].status})
                await objects[i].save()
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