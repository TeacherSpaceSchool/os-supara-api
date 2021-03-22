const RouteOsSupara = require('../models/route');
const DivisionOsSupara = require('../models/division');

const type = `
  type Route {
    _id: ID
    createdAt: Date
    roles: [String]
    division: Division
  }
`;

const query = `
    routes(search: String!, skip: Int): [Route]
`;

const mutation = `
    setRoute(_id: ID!, roles: [String]!, division: ID): Data
    addRoute(roles: [String]!, division: ID!): Route
    deleteRoute(_id: [ID]!): Data
`;

const resolvers = {
    routes: async(parent, {search, skip}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)&&user.checkedPinCode) {
            let divisions
            if(search.length){
                divisions = await DivisionOsSupara.find({name: {'$regex': search, '$options': 'i'}}).distinct('_id').lean()
            }
            return await RouteOsSupara.find({
                ...search.length?{division: {$in: divisions}}:{}
            })
                .populate({
                    path: 'division',
                    select: '_id name',
                })
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }
    }
};

const resolversMutation = {
    addRoute: async(parent, {roles, division}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)&&user.checkedPinCode){
            let object = new RouteOsSupara({
                    roles: roles,
                    division: division
                });
            object = await RouteOsSupara.create(object);
            return object
        }
    },
    setRoute: async(parent, {_id, roles, division}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)&&user.checkedPinCode){
            let object = await RouteOsSupara.findById(_id)
            object.roles = roles;
            if(division){
                object.division = division
            }
            await object.save();
            return {data: 'OK'}
        }
    },
    deleteRoute: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)&&user.checkedPinCode){
            await RouteOsSupara.deleteMany({_id: {$in: _id}})
            return {data: 'OK'}
        }
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;