const DistrictAzyk = require('../models/districtAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const mongoose = require('mongoose');

const type = `
  type District {
    _id: ID
    createdAt: Date
    organization: Organization
    client: [Client]
    name: String
    agent: Employment
    ecspeditor: Employment
  }
`;

const query = `
    districts(search: String!, sort: String!, filter: String!): [District]
    district(_id: ID!): District
    sortDistrict: [Sort]
    filterDistrict: [Filter]
`;

const mutation = `
    addDistrict(organization: ID, client: [ID]!, name: String!, agent: ID, ecspeditor: ID): Data
    setDistrict(_id: ID!, organization: ID, client: [ID], name: String, agent: ID, ecspeditor: ID): Data
    deleteDistrict(_id: [ID]!): Data
`;

const resolvers = {
    districts: async(parent, {search, sort, filter}, {user}) => {
        if(user.role==='admin'){
            let districts =  await DistrictAzyk.find({...(filter.length===0?{}:{organization: filter})})
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
                .sort(sort)
            districts = districts.filter(
                district =>
                        (district.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (district.agent&&district.agent.name.toLowerCase().includes(search.toLowerCase()))||
                    (district.organization&&district.organization.name.toLowerCase().includes(search.toLowerCase()))||
                    (district.ecspeditor&&district.ecspeditor.name.toLowerCase().includes(search.toLowerCase()))
            )
            return districts
        }
        else if(['организация', 'менеджер'].includes(user.role)){
            let districts =  await DistrictAzyk.find({
                organization: user.organization
            })
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
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
    district: async(parent, {_id}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(_id)&&user.role==='admin'){
            return await DistrictAzyk.findOne({_id: _id})
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
        }
        else if(['организация', 'менеджер'].includes(user.role)){
            return await DistrictAzyk.findOne({_id: _id, organization: user.organization})
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
        }
        else return null
    },
    sortDistrict: async(parent, ctx, {user}) => {
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
                    name: 'Организация',
                    field: 'organization'
                }
            ]
        }
        return sort
    },
    filterItem: async(parent, ctx, {user}) => {
        let filter = []
        if(user.role==='admin'){
            filter = [
                {
                    name: 'Все',
                    value: ''
                }
            ]
            let organizations = await OrganizationAzyk.find({
                status: 'active',
                del: {$ne: 'deleted'}
            }).sort('name')
            for(let i = 0; i<organizations.length; i++){
                filter = [
                    ... filter,
                    {
                        name: organizations[i].name,
                        value: organizations[i]._id
                    }
                ]
            }
            return filter
        }
    },
};

const resolversMutation = {
    addDistrict: async(parent, {organization, client, name, agent, ecspeditor}, {user}) => {
        if(['admin', 'организация', 'менеджер'].includes(user.role)){
            let _object = new DistrictAzyk({
                name: name,
                client: client,
                agent: agent,
                ecspeditor: ecspeditor,
                organization: organization,
            });
            if(['организация', 'менеджер'].includes(user.role)) _object.organization = user.organization
            _object = await DistrictAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setDistrict: async(parent, {_id, organization, client, ecspeditor, name, agent}, {user}) => {
        let object = await DistrictAzyk.findById(_id)
        if(user.role==='admin'||(['организация', 'менеджер'].includes(user.role)&&user.organization.toString()===object.organization.toString())) {
            if(name)object.name = name
            if(client)object.client = client
            if(agent)object.agent = agent
            if(ecspeditor)object.ecspeditor = ecspeditor
            if(user.role==='admin'){
                object.organization = organization === undefined ? object.organization : organization;
            }
            object.save();
        }
        return {data: 'OK'}
    },
    deleteDistrict: async(parent, { _id }, {user}) => {
        let objects = await DistrictAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(user.role==='admin'||(['организация', 'менеджер'].includes(user.role)&&user.organization.toString()===objects[i].organization.toString())) {
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