const AgentRouteAzyk = require('../models/agentRouteAzyk');
const DistrictAzyk = require('../models/districtAzyk');
const mongoose = require('mongoose');

const type = `
  type AgentRoute {
      _id: ID
      createdAt: Date
      organization: Organization
      clients: [[ID]],
      name: String
      district: District
  }
`;

const query = `
    agentRoutes(organization: ID, search: String!): [AgentRoute]
    agentRoute(_id: ID!): AgentRoute
    districtsWithoutAgentRoutes(organization: ID): [District]
`;

const mutation = `
    addAgentRoute(organization: ID, clients: [[ID]]!, name: String!, district: ID): Data
    setAgentRoute(_id: ID!, clients: [[ID]], name: String): Data
    deleteAgentRoute(_id: [ID]!): Data
`;

const resolvers = {
    agentRoutes: async(parent, {organization, search}, {user}) => {
        if (user.role !== 'admin')
            organization = user.organization
        if(user.role==='admin'){
            let agentRoutes = await AgentRouteAzyk
                .find({organization: organization==='super'?null:organization})
                .populate('district')
                .populate('organization')
            agentRoutes = agentRoutes.filter(
                agentRoute =>
                    (agentRoute.name.toLowerCase()).includes(search.toLowerCase()) ||
                    (agentRoute.district.name.toLowerCase().includes(search.toLowerCase()))
            )
            return agentRoutes
        }
        else if(['суперорганизация', 'организация'].includes(user.role)) {
            let agentRoutes = await AgentRouteAzyk.find({organization: organization})
                .populate('district')
                .populate('organization')
            agentRoutes = agentRoutes.filter(
                agentRoute =>
                    (agentRoute.name.toLowerCase()).includes(search.toLowerCase()) ||
                    (agentRoute.district.name.toLowerCase().includes(search.toLowerCase()))
            )
            return agentRoutes
        }
        else if('менеджер'===user.role) {
            let agentRoutes = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('_id')
            agentRoutes = await AgentRouteAzyk.find({district: {$in: agentRoutes}, organization: organization})
                .populate('district')
                .populate('organization')
            agentRoutes = agentRoutes.filter(
                agentRoute =>
                    (agentRoute.name.toLowerCase()).includes(search.toLowerCase()) ||
                    (agentRoute.district.name.toLowerCase().includes(search.toLowerCase()))
            )
            return agentRoutes
        }
    },
    districtsWithoutAgentRoutes: async(parent, { organization }, {user}) => {
        if(user.role!=='admin')
            organization = user.organization
        let districts = await AgentRouteAzyk
            .find({organization: organization==='super'?null:organization})
            .distinct('district')
        if(['admin', 'суперорганизация', 'организация'].includes(user.role)){
            districts = await DistrictAzyk
                .find({_id: { $nin: districts}, organization: organization==='super'?null:organization})
                .populate({path: 'client', populate: [{path: 'user'}]})
                .populate({ path: 'organization' })
                .sort('-name')
            return districts
        }
        else if('менеджер'===user.role){
            districts = await DistrictAzyk
                .find({_id: { $nin: districts}, manager: user.employment, organization: organization})
                .populate({path: 'client', populate: [{path: 'user'}]})
                .populate({ path: 'organization' })
                .sort('-name')
            return districts
        }
    },
    agentRoute: async(parent, {_id}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(_id)&&user.role==='admin'){
            let res = await AgentRouteAzyk.findOne({_id: _id})
                .populate({path: 'district', populate: [{path: 'client', populate: [{path: 'user'}]}]})
                .populate('organization')
            return res
        }
        else if(['суперорганизация', 'организация'].includes(user.role)){
            return await AgentRouteAzyk.findOne({_id: _id, organization: user.organization})
                .populate({path: 'district', populate: [{path: 'client', populate: [{path: 'user'}]}]})
                .populate('organization')
        }
        else if('менеджер'===user.role){
            let districts = await DistrictAzyk
                .find({manager: user.employment})
                .distinct('_id')
            return await AgentRouteAzyk.findOne({_id: _id, district: {$in: districts}, organization: user.organization})
                .populate({path: 'district', populate: [{path: 'client', populate: [{path: 'user'}]}]})
                .populate('organization')
        }
        else if(['агент', 'суперагент'].includes(user.role)){
            let res = await DistrictAzyk
                .findOne({agent: user.employment})
            res = await AgentRouteAzyk.findOne({district: res._id, organization: user.organization})
                .populate({path: 'district', populate: [{path: 'client', populate: [{path: 'user'}]}]})
                .populate('organization')
            return res
        }
        else return null
    }
};

const resolversMutation = {
    addAgentRoute: async(parent, {organization, clients, name, district}, {user}) => {
        if(['admin', 'суперорганизация', 'организация', 'менеджер'].includes(user.role)) {
            let _object = new AgentRouteAzyk({
                name: name,
                district: district,
                organization: organization!=='super'?organization:undefined,
                clients: clients,
            });
            await AgentRouteAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setAgentRoute: async(parent, {_id, clients, name}, {user}) => {
        let object = await AgentRouteAzyk.findById(_id)
        if(['admin', 'суперорганизация', 'организация', 'менеджер', 'агент', 'суперагент'].includes(user.role)) {
            if(name)object.name = name
            if(clients)object.clients = clients
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteAgentRoute: async(parent, { _id }, {user}) => {
        let objects = await AgentRouteAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(user.role==='admin'||(['суперорганизация', 'организация', 'менеджер'].includes(user.role)&&objects[i].organization.toString()===user.organization.toString())) {
                await AgentRouteAzyk.deleteMany({_id: objects[i]._id})
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