const RoleCantSyt = require('../models/roleCantSyt');
const mongoose = require('mongoose');

const type = `
  type Role {
    _id: ID
    createdAt: Date
    name: String
  }
`;

const query = `
    role(_id: ID!): Role
    roles(search: String!): [Role]
`;

const mutation = `
    addRole(name: String!): Role
    setRole(_id: ID!, name: String): Data
    deleteRole(_id: [ID]!): Data
`;

const resolvers = {
    roles: async(parent, {search}) => {
        return await RoleCantSyt.find({
            name: {'$regex': search, '$options': 'i'}
        }).sort('name').lean()
    },
    role: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            return await RoleCantSyt.findOne({
                _id: _id
            }).lean()
        } else return null
    },
};

const resolversMutation = {
    addRole: async(parent, {name}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)&&!['admin', 'менеджер', 'специалист', 'бухгалтерия', 'кассир', 'снабженец', 'генеральный директор', 'финансовый директор', 'начальник отдела'].includes(name)){
            let _object = new RoleCantSyt({
                name: name
            });
            _object = await RoleCantSyt.create(_object)
            return _object
        }
    },
    setRole: async(parent, {_id,  name}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)&&!['admin', 'менеджер', 'специалист', 'бухгалтерия', 'кассир', 'снабженец', 'генеральный директор', 'финансовый директор', 'начальник отдела'].includes(name)){
            let object = await RoleCantSyt.findById(_id)
            if(name) object.name = name
            object.save();
        }
        return {data: 'OK'}
    },
    deleteRole: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)){
            await RoleCantSyt.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;