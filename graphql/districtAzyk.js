const DistrictAzyk = require('../models/districtAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const mongoose = require('mongoose');
const ClientAzyk = require('../models/clientAzyk');
const ItemAzyk = require('../models/itemAzyk');
const OrderAzyk = require('../models/orderAzyk');

const type = `
  type District {
      _id: ID
      createdAt: Date
      organization: Organization
      distributer: Organization
      client: [Client]
      name: String
      agent: Employment
      ecspeditor: Employment
      manager: Employment
  }
`;

const query = `
    districts(organization: ID, search: String!, sort: String!): [District]
    district(_id: ID!): District
    sortDistrict: [Sort]
    clientsWithoutDistrict(organization: ID): [Client]
`;

const mutation = `
    addDistrict(organization: ID, distributer: ID, client: [ID]!, name: String!, agent: ID, manager: ID, ecspeditor: ID): Data
    setDistrict(_id: ID!, distributer: ID, client: [ID], name: String, agent: ID, manager: ID, ecspeditor: ID): Data
    deleteDistrict(_id: [ID]!): Data
`;

const resolvers = {
    districts: async(parent, {organization, search, sort}, {user}) => {
        if(user.role==='admin'){
            if(organization==='super'){
                let districts = await DistrictAzyk.find({organization: null})
                    .populate('agent')
                    .populate('client')
                    .populate('ecspeditor')
                    .populate('organization')
                    .populate('distributer')
                    .populate('manager')
                    .sort(sort)
                districts = districts.filter(
                    district =>
                        (district.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (district.agent && district.agent.name.toLowerCase().includes(search.toLowerCase())) ||
                        (district.organization && district.organization.name.toLowerCase().includes(search.toLowerCase())) ||
                        (district.ecspeditor && district.ecspeditor.name.toLowerCase().includes(search.toLowerCase()))
                )
                return districts
            }
            else {
                let districts = await DistrictAzyk.find({organization: organization})
                    .populate('agent')
                    .populate('client')
                    .populate('ecspeditor')
                    .populate('organization')
                    .populate('distributer')
                    .populate('manager')
                    .sort(sort)
                districts = districts.filter(
                    district =>
                        (district.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (district.agent && district.agent.name.toLowerCase().includes(search.toLowerCase())) ||
                        (district.organization && district.organization.name.toLowerCase().includes(search.toLowerCase())) ||
                        (district.ecspeditor && district.ecspeditor.name.toLowerCase().includes(search.toLowerCase()))
                )
                return districts
            }
        }
        else if(['организация'].includes(user.role)){
            let districts =  await DistrictAzyk.find({
                organization: user.organization
            })
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
                .populate('distributer')
                .populate('manager')
                .sort(sort)
            districts = districts.filter(
                district => (
                    (district.name.toLowerCase()).includes(search.toLowerCase()) ||
                    (district.agent&&district.agent.toLowerCase()).includes(search.toLowerCase())||
                    (district.ecspeditor&&district.ecspeditor.name.toLowerCase().includes(search.toLowerCase()))
                )
            )
            return districts
        }
    },
    clientsWithoutDistrict: async(parent, { organization }, {user}) => {
        if(['admin', 'организация'].includes(user.role)){
            if(user.role==='организация')
                organization = user.organization
            let clients = await DistrictAzyk
                .find({organization: organization==='super'?null:organization})
                .distinct('client')
            clients = clients.flat()
            if(organization!=='super')
                organization = await OrganizationAzyk.findOne({_id: organization})
            if(organization==='super'||organization.accessToClient)
                clients = await ClientAzyk
                    .find({_id: { $nin: clients}, del: {$ne: 'deleted'}})
                    .populate({
                        path: 'user',
                        match: {status: 'active'}
                    })
                    .populate({ path: 'organization' })
                    .sort('-name')
            else {
                let items = await ItemAzyk.find({organization: user.organization}).distinct('_id')
                clients = await OrderAzyk.find({item: {$in: items}}).distinct('client')
                clients = await ClientAzyk
                    .find({
                        _id: { $nin: clients},
                        $or: [{_id: {$in: clients}}, {organization: user.organization}],
                        del: {$ne: 'deleted'}
                    })
                    .populate({
                        path: 'user',
                        match: {status: 'active'}
                    })
                    .populate({path: 'organization'})
                    .sort('-name')
            }
            clients = clients.filter(client => (
                client.user&&
                client.address[0]&&
                !(client.name.toLowerCase()).includes('агент')&&
                !(client.name.toLowerCase()).includes('agent'))
            )
            return clients

        }
    },
    district: async(parent, {_id}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(_id)&&user.role==='admin'){
            return await DistrictAzyk.findOne({_id: _id})
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
                .populate('distributer')
                .populate('manager')
        }
        else if(['организация'].includes(user.role)){
            return await DistrictAzyk.findOne({_id: _id, organization: user.organization})
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
                .populate('distributer')
                .populate('manager')
        }
        else return null
    },
    sortDistrict: async() => {
        let sort = [
            {
                name: 'Имя',
                field: 'name'
            }
        ]
        return sort
    },
};

const resolversMutation = {
    addDistrict: async(parent, {distributer, organization, client, name, agent, ecspeditor, manager}, {user}) => {
        if(['admin'].includes(user.role)){
            let _object = new DistrictAzyk({
                name: name,
                client: client,
                agent: agent,
                ecspeditor: ecspeditor,
                organization: organization,
                manager: manager,
                distributer: distributer
            });
            await DistrictAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setDistrict: async(parent, {distributer, _id, client, ecspeditor, name, agent, manager}, {user}) => {
        let object = await DistrictAzyk.findById(_id)
        if(user.role==='admin') {
            if(name)object.name = name
            if(client)object.client = client
            if(agent)object.agent = agent
            if(ecspeditor)object.ecspeditor = ecspeditor
            if(manager)object.manager = manager
            if(user.role==='admin'){
                if(distributer)object.distributer = distributer
            }
            object.save();
        }
        return {data: 'OK'}
    },
    deleteDistrict: async(parent, { _id }, {user}) => {
        let objects = await DistrictAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(user.role==='admin') {
                await DistrictAzyk.deleteMany({_id: objects[i]._id})
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