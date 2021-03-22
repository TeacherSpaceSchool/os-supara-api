const CategoryOsSupara = require('../models/category');
const ItemOsSupara = require('../models/item');

const type = `
  type Category {
      _id: ID
      createdAt: Date
      name: String
      del: String
      GUID: String
 }
`;

const query = `
    categorys(search: String!, skip: Int): [Category]
    categorysTrash(search: String!): [Category]
    category(_id: ID!): Category
`;

const mutation = `
    addCategory(name: String!, GUID: String): Category
    setCategory(_id: ID!, name: String, GUID: String): Data
    deleteCategory(_id: [ID]!): Data
    restoreCategory(_id: [ID]!): Data
`;

const resolvers = {
    categorysTrash: async(parent, {search}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)&&user.checkedPinCode){
            let categorys =  await CategoryOsSupara.find({
                del: 'deleted',
                name: {'$regex': search, '$options': 'i'}
            })
                .sort('name')
                .lean()
            return categorys
        }
    },
    categorys: async(parent, {search, skip}, {user}) => {
        if(user.checkedPinCode) {
            let res = await CategoryOsSupara.find({
                $and: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {name: {$ne: 'Прочие'}},
                    {name: {$ne: 'Автозакуп'}},
                ],
                del: {$ne: 'deleted'},
            })
                .sort('name')
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 15 : 10000000000)
                .lean()
            return res
        }
    },
    category: async(parent, {_id}, {user}) => {
        if(user.checkedPinCode) {
            return await CategoryOsSupara.findOne({
                _id: _id
            })
                .lean()
        }
    },
};

const resolversMutation = {
    addCategory: async(parent, {name, GUID}, {user}) => {
        if(['admin', 'менеджер', 'специалист', 'снабженец'].includes(user.role)&&name!=='Прочие'&&user.checkedPinCode){
            let _object = new CategoryOsSupara({
                name: name,
                GUID: GUID
            });
            _object = await CategoryOsSupara.create(_object)
            return _object;
        }
    },
    setCategory: async(parent, {_id, name, GUID}, {user}) => {
        if(['admin', 'менеджер', 'специалист', 'снабженец'].includes(user.role)&&name!=='Прочие'&&user.checkedPinCode) {
            let object = await CategoryOsSupara.findById(_id)
            if(name) object.name = name
            if(GUID) object.GUID = GUID
            object.save();
        }
        return {data: 'OK'}
    },
    deleteCategory: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер', 'специалист', 'снабженец'].includes(user.role)&&user.checkedPinCode){
            await CategoryOsSupara.updateMany({_id: {$in: _id}, name: {$ne: 'Прочие'}}, {del: 'deleted'})
            let category = await CategoryOsSupara.findOne({name: 'Прочие'}).lean()
            await ItemOsSupara.updateMany({category: {$in: _id}}, {category: category})
        }
        return {data: 'OK'}
    },
    restoreCategory: async(parent, { _id }, {user}) => {
        if(['admin', 'менеджер', 'специалист', 'снабженец'].includes(user.role)&&user.checkedPinCode){
            await CategoryOsSupara.updateMany({_id: {$in: _id}}, {del: null})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;