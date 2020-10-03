const RouteCantSyt = require('../models/routeCantSyt');
const DivisionCantSyt = require('../models/divisionCantSyt');

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
        if(['admin', 'менеджер'].includes(user.role)) {
            let divisions
            if(search.length){
                divisions = await DivisionCantSyt.find({name: {'$regex': search, '$options': 'i'}}).distinct('_id').lean()
            }
            return await RouteCantSyt.find({
                ...search.length?{division: {$in: divisions}}:{}
            }).populate('division')
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }
    }
};

const resolversMutation = {
    addRoute: async(parent, {roles, division}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)){
            let object = new RouteCantSyt({
                    roles: roles,
                    division: division
                });
            object = await RouteCantSyt.create(object);
            return object
        }
    },
    setRoute: async(parent, {_id, roles, division}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)){
            let object = await RouteCantSyt.findById(_id)
            object.roles = roles;
            if(division){
                object.division = division
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