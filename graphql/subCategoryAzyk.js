const SubCategoryAzyk = require('../models/subCategoryAzyk');
const ItemAzyk = require('../models/itemAzyk');
const mongoose = require('mongoose');
const { getSubCategoryUndefinedId } = require('../module/subCategoryAzyk');

const type = `
  type SubCategory {
    _id: ID
    category: Category
    name: String
    status: String
    createdAt: Date
  }
`;

const query = `
    subCategorys(category: ID!, search: String!, sort: String!, filter: String!): [SubCategory]
    subCategory(_id: ID!): SubCategory
    sortSubCategory: [Sort]
    filterSubCategory: [Filter]
`;

const mutation = `
    addSubCategory(name: String!, category: ID!): Data
    setSubCategory(_id: ID!, name: String, category: ID): Data
    deleteSubCategory(_id: [ID]!): Data
    onoffSubCategory(_id: [ID]!): Data
`;

const resolvers = {
    subCategorys: async(parent, {category, search, sort, filter}, {user}) => {
        if(category==='all'||mongoose.Types.ObjectId.isValid(category)){
            if(user.role==='admin'){
                if(category!=='all'){
                    return await SubCategoryAzyk.find({
                        name: {'$regex': search, '$options': 'i'},
                        category: category,
                        status:  filter.length===0?{'$regex': filter, '$options': 'i'}:filter
                    }).populate('category').sort(sort)
                }
                else {
                    return await SubCategoryAzyk.find({
                        name: {'$regex': search, '$options': 'i'},
                        status:  filter.length===0?{'$regex': filter, '$options': 'i'}:filter
                    }).populate('category').sort(sort)
                }
            }
            else {
                if(category!=='all')
                    return await SubCategoryAzyk.find({
                        name: {'$regex': search, '$options': 'i'},
                        category: category,
                        status: 'active'
                    }).populate('category').sort(sort)
                else
                    return await SubCategoryAzyk.find({
                        name: {'$regex': search, '$options': 'i'},
                        status: 'active'
                    }).populate('category').sort(sort)

            }

        }
        else return []
    },
    subCategory: async(parent, {_id}) => {
        if(_id!=='all')
            return await SubCategoryAzyk.findOne({
                _id: _id
            }).populate('category')
        return null
    },
    sortSubCategory: async(parent, ctx, {user}) => {
        let sort = [
            {
                name: 'Имя',
                field: 'name'
            }
        ]
        if(user.role==='admin') {
            sort = [
                ...sort,
                {
                    name: 'Статус',
                    field: 'status'
                }
            ]
        }
        return sort
    },
    filterSubCategory: async(parent, ctx, {user}) => {
        if(user.role==='admin')
            return await [
                {
                    name: 'Все',
                    value: ''
                },
                {
                    name: 'Активные',
                    value: 'active'
                },
                {
                    name: 'Неактивные',
                    value: 'deactive'
                }
            ]
        else
            return await []
    },
};

const resolversMutation = {
    addSubCategory: async(parent, {category, name}, {user}) => {
        if(user.role==='admin'&&name!=='Не задано'){
            let _object = new SubCategoryAzyk({
                category: category,
                name: name,
                status: 'active'
            });
            await SubCategoryAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setSubCategory: async(parent, {_id, name, category}, {user}) => {
        if(user.role==='admin') {
            let object = await SubCategoryAzyk.findById(_id)
            if(name&&name!=='Не задано')object.name = name
            if(category)object.category = category
            object.save();
        }
        return {data: 'OK'}
    },
    onoffSubCategory: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await SubCategoryAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                objects[i].save()
            }
        }
        return {data: 'OK'}
    },
    deleteSubCategory: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            await ItemAzyk.updateMany({subCategory: {$in: _id}}, {subCategory: getSubCategoryUndefinedId(), status: 'deactive'})
            await SubCategoryAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;