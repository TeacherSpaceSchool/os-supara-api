const ItemAzyk = require('../models/itemAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const BasketAzyk = require('../models/basketAzyk');
const mongoose = require('mongoose');
const { saveFile, deleteFile, urlMain } = require('../module/const');

const type = `
  type Item {
    _id: ID
    favorite: [ID]
    basket: [ID]
    deliveryDays: [String]
    createdAt: Date
    stock: Int
    name: String
    info: String
    image: String
    price: Int
    reiting: Int
    subCategory: SubCategory
    organization: Organization
    hit: Boolean
    latest: Boolean
    status: String
  }
`;

const query = `
    items(subCategory: ID!, search: String!, sort: String!, filter: String!): [Item]
    brands(organization: ID!, search: String!, sort: String!): [Item]
    item(_id: ID!): Item
    sortItem: [Sort]
    filterItem: [Filter]
    favorites(search: String!): [Item]
`;

const mutation = `
    addItem(stock: Int!, name: String!, deliveryDays: [String], info: String!, image: Upload, price: Int!, subCategory: ID!, organization: ID!, hit: Boolean!, latest: Boolean!): Data
    setItem(_id: ID!, stock: Int, name: String, info: String, deliveryDays: [String], image: Upload, price: Int, subCategory: ID, organization: ID, hit: Boolean, latest: Boolean): Data
    deleteItem(_id: [ID]!): Data
    onoffItem(_id: [ID]!): Data
    favoriteItem(_id: [ID]!): Data
    addFavoriteItem(_id: [ID]!): Data
`;

const resolvers = {
    items: async(parent, {subCategory, search, sort, filter}, {user}) => {
        if(user.role==='admin'){
            if(subCategory!=='all'&&mongoose.Types.ObjectId.isValid(subCategory)){
                let items =  await ItemAzyk.find({
                    subCategory: subCategory,
                    del: {$ne: 'deleted'}
                })
                    .populate('subCategory')
                    .populate({ path: 'organization',
                        match: {name: filter.length===0?{'$regex': '', '$options': 'i'}:filter} })
                    .sort(sort)
                items = items.filter(
                    item => (
                            (item.name.toLowerCase()).includes(search.toLowerCase()) ||
                            (item.info.toLowerCase()).includes(search.toLowerCase())
                        )
                        && item.organization)
                return items
            }
            else {
                let items =  await ItemAzyk.find({
                    del: {$ne: 'deleted'}
                })
                    .populate('subCategory')
                    .populate({ path: 'organization', match: {name: filter.length===0?{'$regex': '', '$options': 'i'}:filter} })
                    .sort(sort)
                items = items.filter(
                    item => (
                            (item.name.toLowerCase()).includes(search.toLowerCase()) ||
                            (item.info.toLowerCase()).includes(search.toLowerCase())
                        )
                        && item.organization)
                return items
            }
        }
        else if(['экспедитор', 'организация', 'менеджер', 'агент'].includes(user.role)){
            let employment = await EmploymentAzyk.findOne({user: user._id})
            if(subCategory!=='all'&&mongoose.Types.ObjectId.isValid(subCategory)){
                let items =  await ItemAzyk.find({
                    subCategory: subCategory,
                    organization: employment.organization,
                    del: {$ne: 'deleted'}
                })
                    .populate('subCategory')
                    .populate('organization')
                    .sort(sort)
                items = items.filter(
                    item => (
                        (item.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (item.info.toLowerCase()).includes(search.toLowerCase())
                    )
                )
                return items
            }
            else {
                let items =  await ItemAzyk.find({
                    organization: employment.organization,
                    del: {$ne: 'deleted'}
                })
                    .populate('subCategory')
                    .populate('organization')
                    .sort(sort)
                items = items.filter(
                    item => (
                        (item.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (item.info.toLowerCase()).includes(search.toLowerCase())
                    )
                )
                return items
            }
        }
        else  if(user.role==='client'||user.role===undefined){
            if(subCategory!=='all'&&mongoose.Types.ObjectId.isValid(subCategory)){
                let items =  await ItemAzyk.find({
                    status: 'active',
                    subCategory: subCategory,
                    del: {$ne: 'deleted'}
                })
                    .populate('subCategory')
                    .populate({ path: 'organization',
                        match: {name: filter.length===0?{'$regex': '', '$options': 'i'}:filter,
                            status: 'active'} })
                    .sort(sort)
                items = items.filter(
                    item => (
                            (item.name.toLowerCase()).includes(search.toLowerCase()) ||
                            (item.info.toLowerCase()).includes(search.toLowerCase())
                        )
                        && item.organization)
                return items
            }
            else {
                let items =  await ItemAzyk.find({
                    status: 'active',
                    del: {$ne: 'deleted'}
                })
                    .populate('subCategory')
                    .populate({ path: 'organization', match: {status: 'active',
                        name: filter.length===0?{'$regex': '', '$options': 'i'}:filter} })
                    .sort(sort)
                items = items.filter(
                    item => (
                            (item.name.toLowerCase()).includes(search.toLowerCase()) ||
                            (item.info.toLowerCase()).includes(search.toLowerCase())
                        )
                        && item.organization)
                return items
            }

        }
    },
    brands: async(parent, {organization, search, sort}) => {
        if(mongoose.Types.ObjectId.isValid(organization)) {
            let items = await ItemAzyk.find({
                status: 'active',
                organization: organization,
                del: {$ne: 'deleted'}
            })
                .populate('subCategory')
                .populate({
                    path: 'organization',
                    match: {status: 'active'}
                })
                .sort(sort)
            items = items.filter(
                item => (
                        (item.name.toLowerCase()).includes(search.toLowerCase()) ||
                        (item.info.toLowerCase()).includes(search.toLowerCase())
                    )
                    && item.organization)

            return items
        }
        else return []

    },
    favorites: async(parent, {search}, {user}) => {
       let items =  await ItemAzyk.find({
           name: {'$regex': search, '$options': 'i'},
           info: {'$regex': search, '$options': 'i'},
           status: 'active',
           favorite: user._id,
           del: {$ne: 'deleted'}
       })
           .populate('subCategory')
           .populate({ path: 'organization', match: {name: {'$regex': search, '$options': 'i'}} })
           .sort('-createdAt')
        items = items.filter(item => (item.organization))
        return items
    },
    item: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            return await ItemAzyk.findOne({
                _id: _id,
            })
                .populate({path: 'subCategory', populate: [{path: 'category'}]})
                .populate('organization')
        } else return null
    },
    sortItem: async(parent, ctx, {user}) => {
        let sort = [
            {
                name: 'Имя',
                field: 'name'
            },
            {
                name: 'Цена',
                field: 'price'
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
    filterItem: async(parent, ctx, {user}) => {
        let filter = [
            {
                name: 'Все',
                value: ''
            }
        ]
        if(!['экспедитор', 'организация', 'менеджер'].includes(user.role)){
            let organizations = await OrganizationAzyk.find().sort('name')
            for(let i = 0; i<organizations.length; i++){
                filter = [
                    ... filter,
                    {
                        name: organizations[i].name,
                        value: organizations[i].name
                    }
                ]
            }
        }
        return filter
    },
};

const resolversMutation = {
    addItem: async(parent, {stock, name, image, info, price, subCategory, organization, hit, latest, deliveryDays}, {user}) => {
        if(['admin', 'организация', 'менеджер'].includes(user.role)){
            let { stream, filename } = await image;
            filename = await saveFile(stream, filename)
            let _object = new ItemAzyk({
                stock: stock,
                name: name,
                image: urlMain+filename,
                info: info,
                price: price,
                reiting: 0,
                subCategory: subCategory,
                organization: organization,
                hit: hit,
                latest: latest,
                status: 'active',
                deliveryDays: deliveryDays
            });
            if(['организация', 'менеджер'].includes(user.role)) _object.organization = user.organization
            _object = await ItemAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setItem: async(parent, {_id, stock, name, image, info, price, subCategory, organization, hit, latest, deliveryDays}, {user}) => {
        let object = await ItemAzyk.findById(_id)
        if(user.role==='admin'||(['организация', 'менеджер'].includes(user.role)&&user.organization.toString()===object.organization.toString())) {
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveFile(stream, filename)
                object.image = urlMain + filename
            }
            if(name)object.name = name
            if(info)object.info = info
            if(stock)object.stock = stock
            if(price)object.price = price
            if(hit)object.hit = hit
            if(latest)object.latest = latest
            if(subCategory)object.subCategory = subCategory
            if(deliveryDays)object.deliveryDays = deliveryDays
            if(user.role==='admin'){
                object.organization = organization === undefined ? object.organization : organization;
            }
            object.save();
        }
        return {data: 'OK'}
    },
    onoffItem: async(parent, { _id }, {user}) => {
        let objects = await ItemAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(user.role==='admin'|| (['организация', 'менеджер'].includes(user.role)&&user.organization.toString()===objects[i].organization.toString())){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                objects[i].save()
            }
        }
        return {data: 'OK'}
    },
    deleteItem: async(parent, { _id }, {user}) => {
        let objects = await ItemAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(user.role==='admin'||(['организация', 'менеджер'].includes(user.role)&&user.organization.toString()===objects[i].organization.toString())) {
                objects[i].del = 'deleted'
                objects[i].save()
                await BasketAzyk.deleteMany({item: {$in: objects[i]._id}})
            }
        }
        return {data: 'OK'}
    },
    favoriteItem: async(parent, { _id }, {user}) => {
        let objects = await ItemAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            let index = objects[i].favorite.indexOf(user._id)
            if(index===-1)
                objects[i].favorite.push(user._id)
            else
                objects[i].favorite.splice(index, 1)
            objects[i].save()
        }
        return {data: 'OK'}
    },
    addFavoriteItem: async(parent, { _id }, {user}) => {
        let objects = await ItemAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            let index = objects[i].favorite.indexOf(user._id)
            if(index===-1)
                objects[i].favorite.push(user._id)
            objects[i].save()
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;