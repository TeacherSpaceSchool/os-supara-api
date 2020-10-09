const ItemCantSyt = require('../models/itemCantSyt');
const CategoryCantSyt = require('../models/categoryCantSyt');
const mongoose = require('mongoose');
const { saveFile, deleteFile } = require('../module/const');
const readXlsxFile = require('read-excel-file/node');
const path = require('path');
const app = require('../app');

const type = `
  type Item {
      _id: ID
      createdAt: Date
      name: String
      category: Category
 }
`;

const query = `
    items(category: ID, search: String!, skip: Int): [Item]
    item(_id: ID!): Item
    filterItem: [Filter]
`;

const mutation = `
    addItem( name: String!, category: ID! ): Item
    setItem(_id: ID!, name: String, category: ID ): Data
    deleteItem(_id: [ID]!): Data
    unloadingItem(document: Upload!): Data
`;

const resolvers = {
    items: async(parent, {category, search, skip}) => {
        let items =  await ItemCantSyt.find({
            ...category&&mongoose.Types.ObjectId.isValid(category)?{category: category}:{},
            $or: [
                {name: {'$regex': search, '$options': 'i'}}
            ]
        })
            .populate('category')
            .sort('name')
            .skip(skip!=undefined?skip:0)
            .limit(skip!=undefined?15:10000000000)
            .lean()
        return items
    },
    item: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            return await ItemCantSyt.findOne({
                _id: _id,
            })
                .populate('category')
                .lean()
        } else return null
    },
    filterItem: async() => {
        let categorys = await CategoryCantSyt.find({
            del: {$ne: 'deleted'}
        }).select('name _id').sort('name').lean()
        let filter = [
            {
                name: 'Все',
                value: ''
            }
        ]
        for(let i = 0; i<categorys.length; i++){
            filter = [
                ... filter,
                {
                    name: categorys[i].name,
                    value: categorys[i]._id
                }
            ]
        }
        return filter
    },
};

const resolversMutation = {
    addItem: async(parent, {name, category, }, {user}) => {
            let _object = new ItemCantSyt({
                name: name,
                category: category
            });
            _object = await ItemCantSyt.create(_object)
            return _object
    },
    setItem: async(parent, {_id, name, category, }, {user}) => {
        let object = await ItemCantSyt.findById(_id)
        if(name)object.name = name
        if(category)object.category = category
        await object.save();
        return {data: 'OK'}
    },
    deleteItem: async(parent, { _id }, {user}) => {
        await ItemCantSyt.deleteMany({_id: {$in: _id}})
        return {data: 'OK'}
    },
    unloadingItem: async(parent, { document }, {user}) => {
        if(user.role==='admin'){
            let {stream, filename} = await document;
            filename = await saveFile(stream, filename);
            let xlsxpath = path.join(app.dirname, 'public', filename);
            let rows = await readXlsxFile(xlsxpath)
            let _object
            for(let i = 0;i<rows.length;i++){
                _object = await ItemCantSyt.findOne({name: rows[i][0]}).lean()
                if (!_object) {
                    let category = await CategoryCantSyt.findOne({name: 'Прочие'}).lean()
                    _object = new ItemCantSyt({
                        name: rows[i][0],
                        category: category._id
                    });
                    _object = await ItemCantSyt.create(_object)
                }
            }
            await deleteFile(filename)
            return({data: 'OK'})
        }
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;