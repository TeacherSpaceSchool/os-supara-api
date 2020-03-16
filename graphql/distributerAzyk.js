const DistributerAzyk = require('../models/distributerAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const mongoose = require('mongoose');

const type = `
  type Distributer {
      _id: ID
      createdAt: Date
      distributer: Organization
      organizations: [Organization]
  }
`;

const query = `
    distributers(distributer: ID, search: String!): [Distributer]
    distributer(_id: ID!): Distributer
    organizationsWithoutDistributer(distributer: ID!): [Organization]
`;

const mutation = `
    addDistributer(distributer: ID!, organizations: [ID]): Data
    setDistributer(_id: ID!, organizations: [ID]): Data
    deleteDistributer(_id: [ID]!): Data
`;

const resolvers = {
    distributers: async(parent, {distributer, search, sort}, {user}) => {
        if(user.role==='admin'){
            let distributers = await DistributerAzyk.find({distributer: distributer})
                    .populate('organizations')
                    .populate('distributer')
                    .sort(sort)
            distributers = distributers.filter(
                distributer =>
                        (distributer.organization && distributer.organization.name.toLowerCase().includes(search.toLowerCase()))
                )
                return distributers
        }
    },
    organizationsWithoutDistributer: async(parent, { distributer }, {user}) => {
        if('admin'===user.role){
            let organizations = await DistributerAzyk
                .findOne({distributer: distributer})
                .distinct('organizations')
            organizations = [distributer, ...organizations]
            organizations = await OrganizationAzyk
                .find({_id: { $nin: organizations}, del: {$ne: 'deleted'}})
                .sort('-name')
            return organizations

        }
    },
    distributer: async(parent, {_id}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(_id)&&user.role==='admin'){
            return await DistributerAzyk.findOne({$or:[{_id: _id}, {distributer: _id}]})
                .populate('organizations')
                .populate('distributer')
        }
        else return null
    },
};

const resolversMutation = {
    addDistributer: async(parent, {distributer, organizations}, {user}) => {
        if(['admin'].includes(user.role)){
            let _object = new DistributerAzyk({
                distributer: distributer,
                organizations: organizations
            });
            await DistributerAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setDistributer: async(parent, {_id,  organizations}, {user}) => {
        let object = await DistributerAzyk.findById(_id)
        if(user.role==='admin') {
            if(organizations)object.organizations = organizations
            object.save();
        }
        return {data: 'OK'}
    },
    deleteDistributer: async(parent, { _id }, {user}) => {
        if(user.role==='admin') {
            await DistributerAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;