const RouteCantSyt = require('../models/routeCantSyt');
const UserCantSyt = require('../models/userCantSyt');

const type = `
  type Route {
    _id: ID
    createdAt: Date
    roles: [String]
    specialists: [User]
  }
`;

const query = `
    routes(search: String!, skip: Int): [Route]
`;

const mutation = `
    setRoute(_id: ID!, roles: [String]!, specialists: [ID]): Data
    addRoute(roles: [String]!, specialists: [ID]!): Route
    deleteRoute(_id: [ID]!): Data
`;

const resolvers = {
    routes: async(parent, {search, skip}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)) {
            let specialists
            if(search.length){
                specialists = await UserCantSyt.find({name: {'$regex': search, '$options': 'i'}}).distinct('_id').lean()
            }
            let res = await RouteCantSyt.find({
                ...search.length?{specialists: {$in: specialists}}:{}
            }).populate('specialists')
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
            return res
        }
    }
};

const resolversMutation = {
    addRoute: async(parent, {roles, specialists}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)){
            let object = new RouteCantSyt({
                    roles: roles,
                specialists: specialists
                });
            object = await RouteCantSyt.create(object);
            return object
        }
    },
    setRoute: async(parent, {_id, roles, specialists}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)){
            let object = await RouteCantSyt.findById(_id)
            object.roles = roles;
            if(specialists){
                object.specialists = specialists
            }
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteRoute: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)){
            await RouteCantSyt.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;