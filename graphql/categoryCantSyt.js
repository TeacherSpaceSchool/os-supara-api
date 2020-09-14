const CategoryCantSyt = require('../models/categoryCantSyt');
const ItemCantSyt = require('../models/itemCantSyt');

const type = `
  type Category {
      _id: ID
      createdAt: Date
      name: String
      del: String
      term: Int
      suppliers: [User]
      GUID: String
 }
`;

const query = `
    categorys(search: String!): [Category]
    categorysTrash(search: String!): [Category]
    category(_id: ID!): Category
`;

const mutation = `
    addCategory(term: Int!, name: String!, suppliers: [ID]!, GUID: String): Category
    setCategory(_id: ID!, term: Int, name: String, suppliers: [ID], GUID: String): Data
    deleteCategory(_id: [ID]!): Data
    restoreCategory(_id: [ID]!): Data
`;

const resolvers = {
    categorysTrash: async(parent, {search}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)){
            let categorys =  await CategoryCantSyt.find({
                del: 'deleted',
                name: {'$regex': search, '$options': 'i'}
            })
                .populate('suppliers')
                .sort('name')
                .lean()
            return categorys
        }
    },
    categorys: async(parent, {search}) => {
        return await CategoryCantSyt.find({
            name: {'$regex': search, '$options': 'i'},
            del: {$ne: 'deleted'},
        })
            .populate('suppliers')
            .sort('name').lean()
    },
    category: async(parent, {_id}) => {
        return await CategoryCantSyt.findOne({
            _id: _id
        })
            .populate('suppliers')
            .lean()
    },
};

const resolversMutation = {
    addCategory: async(parent, {term, name, suppliers, GUID}, {user}) => {
        if(['admin', 'менеджер', 'специалист', 'снабженец'].includes(user.role)){
            let _object = new CategoryCantSyt({
                term: term,
                name: name,
                suppliers: suppliers,
                GUID: GUID
            });
            _object = await CategoryCantSyt.create(_object)
            return _object;
        }
    },
    setCategory: async(parent, {_id, term, name, suppliers, GUID}, {user}) => {
        if(['admin', 'менеджер', 'специалист', 'снабженец'].includes(user.role)) {
            let object = await CategoryCantSyt.findById(_id)
            if (term!=undefined) object.term = term
            if(name) object.name = name
            if(GUID) object.GUID = GUID
            object.suppliers= suppliers
            object.save();
        }
        return {data: 'OK'}
    },
    deleteCategory: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер', 'специалист', 'снабженец'].includes(user.role)){
            await CategoryCantSyt.updateMany({_id: {$in: _id}}, {del: 'deleted'})
            await ItemCantSyt.updateMany({category: {$in: _id}}, {del: 'deleted'})
        }
        return {data: 'OK'}
    },
    restoreCategory: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер', 'специалист', 'снабженец'].includes(user.role)){
            await CategoryCantSyt.updateMany({_id: {$in: _id}}, {del: null})
            await ItemCantSyt.updateMany({category: {$in: _id}}, {del: null})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;