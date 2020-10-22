const SubdivisionCantSyt = require('../models/subdivisionCantSyt');
const DivisionCantSyt = require('../models/divisionCantSyt');
const mongoose = require('mongoose');

const type = `
  type Subdivision {
    _id: ID
    createdAt: Date
    name: String
    division: Division
  }
`;

const query = `
    subdivisions(search: String!, skip: Int, division: ID): [Subdivision]
    filterSubdivision: [Filter]
`;

const mutation = `
    addSubdivision( name: String!, division: ID!): Subdivision
    setSubdivision(_id: ID!, name: String, division: ID): Data
    deleteSubdivision(_id: [ID]!): Data
`;

const resolvers = {
    subdivisions: async(parent, {search, skip, division}) => {
        let subdivisions =  await SubdivisionCantSyt.find({
            name: {'$regex': search, '$options': 'i'},
            ...division&&mongoose.Types.ObjectId.isValid(division)?{division: division}:{},
        })
            .populate('division')
            .sort('name')
            .skip(skip!=undefined?skip:0)
            .limit(skip!=undefined?15:10000000000)
            .lean()
        return subdivisions
    },
    filterSubdivision: async() => {
        let filter = await DivisionCantSyt.find({
            del: {$ne: 'deleted'}
        }).select('name _id').sort('name').lean()
        return filter
    },
};

const resolversMutation = {
    addSubdivision: async(parent, {name, division}) => {
            let _object = new SubdivisionCantSyt({
                name: name,
                division: division
            });
            _object = await SubdivisionCantSyt.create(_object)
            return _object
    },
    setSubdivision: async(parent, {_id, name, division}) => {
        let object = await SubdivisionCantSyt.findById(_id)
        if(name)object.name = name
        if(division)object.division = division
        await object.save();
        return {data: 'OK'}
    },
    deleteSubdivision: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)) {
            await SubdivisionCantSyt.deleteMany({subdivision: {$in: _id}})
        }
        return {data: 'OK'}
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;