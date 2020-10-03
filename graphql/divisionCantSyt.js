const DivisionCantSyt = require('../models/divisionCantSyt');
const RouteCantSyt = require('../models/routeCantSyt');

const type = `
  type Division {
    _id: ID
    createdAt: Date
    name: String
    del: String
    head: User
    suppliers: [User]
    specialists: [User]
  }
`;

const query = `
    divisions(search: String!, skip: Int): [Division]
    divisionsForRoute: [Division]
    divisionsTrash(search: String!): [Division]
    division(_id: ID!): Division
`;

const mutation = `
    addDivision( name: String!, suppliers: [ID]!, specialists: [ID]!, head: ID): Division
    setDivision(_id: ID!, name: String, suppliers: [ID], specialists: [ID], head: ID): Data
    deleteDivision(_id: [ID]!): Data
    restoreDivision(_id: [ID]!): Data
`;

const resolvers = {
    divisionsTrash: async(parent, {search}, {user}) => {
        if('admin'===user.role){
            let divisions =  await DivisionCantSyt.find({
                del: 'deleted',
                name: {'$regex': search, '$options': 'i'}
            })
                .populate('suppliers')
                .populate('specialists')
                .populate('head')
                .sort('name')
                .lean()
            return divisions
        }
    },
    divisionsForRoute: async() => {
        let divisions = await RouteCantSyt.find().distinct('division').lean()
        divisions =  await DivisionCantSyt.find({
            _id: {$nin: divisions}
        })
            .populate('suppliers')
            .populate('specialists')
            .populate('head')
            .sort('name')
            .lean()
        return divisions
    },
    divisions: async(parent, {search, skip}) => {
        let divisions =  await DivisionCantSyt.find({
            del: {$ne: 'deleted'},
            name: {'$regex': search, '$options': 'i'}
        })
            .populate('suppliers')
            .populate('specialists')
            .populate('head')
            .sort('name')
            .skip(skip!=undefined?skip:0)
            .limit(skip!=undefined?15:10000000000)
            .lean()
        return divisions
    },
    division: async(parent, {_id}) => {
        return await DivisionCantSyt.findOne({
            _id: _id,
        })
            .populate('suppliers')
            .populate('specialists')
            .lean()
    }
};

const resolversMutation = {
    addDivision: async(parent, {name, suppliers, specialists, head}, {user}) => {
        if(['admin'].includes(user.role)){
            let _object = new DivisionCantSyt({
                name: name,
                suppliers: suppliers,
                specialists: specialists,
                head: head
            });
            _object = await DivisionCantSyt.create(_object)
            return _object
        }
    },
    setDivision: async(parent, {_id, name, suppliers, specialists, head}, {user}) => {
        let object = await DivisionCantSyt.findById(_id)
        if(['admin', 'менеджер'].includes(user.role)) {
            if(name)object.name = name
            object.suppliers = suppliers
            object.specialists = specialists
            object.head = head
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteDivision: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)) {
            await DivisionCantSyt.updateMany({_id: {$in: _id}}, {del: 'deleted', suppliers: []})
            await RouteCantSyt.deleteMany({division: {$in: _id}})
        }
        return {data: 'OK'}
    },
    restoreDivision: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)) {
            await DivisionCantSyt.updateMany({_id: {$in: _id}}, {del: null})
        }
        return {data: 'OK'}
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;