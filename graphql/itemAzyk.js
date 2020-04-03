const ItemAzyk = require('../models/itemAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const DistributerAzyk = require('../models/distributerAzyk');
const SubCategoryAzyk = require('../models/subCategoryAzyk');
const Integrate1CAzyk = require('../models/integrate1CAzyk');
const BasketAzyk = require('../models/basketAzyk');
const mongoose = require('mongoose');
const { saveImage, deleteFile, urlMain } = require('../module/const');

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
    price: Float
    reiting: Int
    subCategory: SubCategory
    organization: Organization
    hit: Boolean
    latest: Boolean
    apiece: Boolean
    status: String
    packaging: Int
    weight: Float
    size: Float
    priotiry: Int
    del: String
  }
`;

const query = `
    items(subCategory: ID!, search: String!, sort: String!, filter: String!): [Item]
    itemsTrash(search: String!): [Item]
    brands(organization: ID!, search: String!, sort: String!): [Item]
    brandOrganizations(search: String!, sort: String!, filter: String!): [Organization]
    item(_id: ID!): Item
    sortItem: [Sort]
    filterItem: [Filter]
    favorites(search: String!): [Item]
`;

const mutation = `
    addItem( priotiry: Int, apiece: Boolean, packaging: Int!, stock: Int!, weight: Float!, size: Float!, name: String!, deliveryDays: [String], info: String!, image: Upload, price: Float!, subCategory: ID!, organization: ID!, hit: Boolean!, latest: Boolean!): Data
    setItem(_id: ID!, priotiry: Int, apiece: Boolean, packaging: Int, stock: Int, weight: Float, size: Float, name: String, info: String, deliveryDays: [String], image: Upload, price: Float, subCategory: ID, organization: ID, hit: Boolean, latest: Boolean): Data
    deleteItem(_id: [ID]!): Data
    restoreItem(_id: [ID]!): Data
    onoffItem(_id: [ID]!): Data
    favoriteItem(_id: [ID]!): Data
    addFavoriteItem(_id: [ID]!): Data
`;

const resolvers = {
    itemsTrash: async(parent, {search}, {user}) => {
        if('admin'===user.role){
            let items =  await ItemAzyk.find({
                del: 'deleted'
            })
                .populate('subCategory')
                .populate({ path: 'organization',
                    match: {del: {$ne: 'deleted'}} })
                .sort('-priotiry')
                items = items.filter(
                    item => (
                            (item.name.toLowerCase()).includes(search.toLowerCase()) ||
                            (item.info.toLowerCase()).includes(search.toLowerCase())
                        )
                        && item.organization)
                return items
        }
    },
    items: async(parent, {subCategory, search, sort, filter}, {user}) => {
        if(['admin', 'суперагент'].includes(user.role)){
            if(subCategory!=='all'&&mongoose.Types.ObjectId.isValid(subCategory)){
                let items =  await ItemAzyk.find({
                    subCategory: subCategory,
                    del: {$ne: 'deleted'}
                })
                    .populate('subCategory')
                    .populate({ path: 'organization',
                        match: {name: filter.length===0?{'$regex': '', '$options': 'i'}:filter} })
                    .sort('-priotiry')
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
                    .sort('-priotiry')
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
            let organizations = await DistributerAzyk.findOne({
                distributer: user.organization
            })
                .populate({path: 'organizations', match: {del: {$ne: 'deleted'}, status: 'active'}})
                .distinct('organizations')
            organizations = organizations.filter(
                organization => (
                    organization
                )
            )
            organizations = organizations.map(
                organization => (
                    organization._id
                )
            )
            organizations = [...organizations, user.organization]
            let items =  await ItemAzyk.find({
                ...(filter.length===0?{}:{subCategory: filter}),
                organization: {$in: organizations},
                del: {$ne: 'deleted'}
            })
                .populate('subCategory')
                .populate('organization')
                .sort('-priotiry')
                .sort(sort)
            items = items.filter(
                item => (
                    (item.name.toLowerCase()).includes(search.toLowerCase()) ||
                    (item.info.toLowerCase()).includes(search.toLowerCase())
                )
            )
            return items
        }
        else  if(user.role==='client'){
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
                    .sort('-priotiry')
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
                    .sort('-priotiry')
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
                .sort('-priotiry')
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
           status: 'active',
           favorite: user._id,
           del: {$ne: 'deleted'}
       })
           .populate('subCategory')
           .populate({ path: 'organization', match: { match: {status: 'active'}} })
           .sort('-createdAt')
        items = items.filter(item => (
                (item.name.toLowerCase()).includes(search.toLowerCase()) ||
                (item.info.toLowerCase()).includes(search.toLowerCase()) ||
                (item.organization.toLowerCase()).includes(search.toLowerCase())
            )
            && item.organization)
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
    brandOrganizations: async(parent, {search, sort, filter}, {user}) => {
        let brandOrganizations = await ItemAzyk.find({
            status: 'active',
            del: {$ne: 'deleted'}
        }).distinct('organization')
        if(user.role==='admin'){
            return await OrganizationAzyk.find({
                _id: {$in: brandOrganizations},
                name: {'$regex': search, '$options': 'i'},
                status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter,
                del: {$ne: 'deleted'}
            }).sort(sort)
        }
        else if(user.role==='агент'){
            brandOrganizations = await DistributerAzyk.findOne({
                distributer: user.organization
            }).distinct('organizations')
            brandOrganizations = [...brandOrganizations, user.organization]
            return await OrganizationAzyk.find({
                _id: {$in: brandOrganizations},
                name: {'$regex': search, '$options': 'i'},
                status: filter.length===0?{'$regex': filter, '$options': 'i'}:filter,
                del: {$ne: 'deleted'}
            }).sort(sort)
        }
        else
            return await OrganizationAzyk.find({
                _id: {$in: brandOrganizations},
                name: {'$regex': search, '$options': 'i'},
                status: 'active',
                del: {$ne: 'deleted'}
            }).sort(sort)
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
        let filter = []
        if(!['экспедитор', 'организация'].includes(user.role)){
            filter = [
                {
                    name: 'Все',
                    value: ''
                }
            ]
            let organizations = await OrganizationAzyk.find({
                status: 'active',
                del: {$ne: 'deleted'}
            }).sort('name')
            for(let i = 0; i<organizations.length; i++){
                filter = [
                    ... filter,
                    {
                        name: organizations[i].name,
                        value: organizations[i]._id
                    }
                ]
            }
        }
        else {
            filter = [
                {
                    name: 'Все',
                    value: ''
                }
            ]
            let subcategorys = await ItemAzyk.find({
                organization: user.organization,
                status: 'active',
                del: {$ne: 'deleted'}
            }).distinct('subCategory')
            subcategorys = await SubCategoryAzyk.find({_id: {$in: subcategorys}})
            for(let i = 0; i<subcategorys.length; i++){
                filter = [
                    ... filter,
                    {
                        name: subcategorys[i].name,
                        value: subcategorys[i]._id
                    }
                ]
            }
        }
        return filter
    },
};

const resolversMutation = {
    addItem: async(parent, {apiece, priotiry, stock, name, image, info, price, subCategory, organization, hit, latest, deliveryDays, packaging, weight, size}, {user}) => {
        if(['admin', 'организация'].includes(user.role)){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
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
                packaging: packaging,
                latest: latest,
                status: 'active',
                deliveryDays: deliveryDays,
                weight: Math.round(weight),
                size: Math.round(size),
                priotiry: priotiry
            });
            if(['организация'].includes(user.role)) _object.organization = user.organization
            if(apiece!=undefined) _object.apiece = apiece
            _object = await ItemAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setItem: async(parent, {apiece, _id, priotiry, weight, size, stock, name, image, info, price, subCategory, organization, packaging, hit, latest, deliveryDays}, {user}) => {
        let object = await ItemAzyk.findById(_id)
        if(user.role==='admin'||(['организация'].includes(user.role)&&user.organization.toString()===object.organization.toString())) {
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(name)object.name = name
            if(weight!=undefined)object.weight = weight
            if(size!=undefined)object.size = size
            if(info)object.info = info
            if(stock!=undefined)object.stock = stock
            if(price)object.price = price
            if(hit!=undefined)object.hit = hit
            if(latest!=undefined)object.latest = latest
            if(subCategory)object.subCategory = subCategory
            if(deliveryDays)object.deliveryDays = deliveryDays
            if(packaging)object.packaging = packaging
            if(apiece!=undefined) object.apiece = apiece
            if(priotiry!=undefined) object.priotiry = priotiry
            if(user.role==='admin'){
                object.organization = organization === undefined ? object.organization : organization;
            }
            await object.save();
        }
        return {data: 'OK'}
    },
    onoffItem: async(parent, { _id }, {user}) => {
        let objects = await ItemAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(user.role==='admin'|| (['организация'].includes(user.role)&&user.organization.toString()===objects[i].organization.toString())){
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                await objects[i].save()
                await BasketAzyk.deleteMany({item: {$in: objects[i]._id}})
            }
        }
        return {data: 'OK'}
    },
    deleteItem: async(parent, { _id }, {user}) => {
        let objects = await ItemAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if(user.role==='admin'||(['организация'].includes(user.role)&&user.organization.toString()===objects[i].organization.toString())) {
                objects[i].del = 'deleted'
                objects[i].status = 'deactive'
                await objects[i].save()
                await BasketAzyk.deleteMany({item: {$in: objects[i]._id}})
                await Integrate1CAzyk.deleteMany({organization: objects[i].organization, item: objects[i]._id})
            }
        }
        return {data: 'OK'}
    },
    restoreItem: async(parent, { _id }, {user}) => {
        if(user.role==='admin') {
            await ItemAzyk.updateMany({_id: {$in: _id}}, {del: null, status: 'active'})
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
            await objects[i].save()
        }
        return {data: 'OK'}
    },
    addFavoriteItem: async(parent, { _id }, {user}) => {
        let objects = await ItemAzyk.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            let index = objects[i].favorite.indexOf(user._id)
            if(index===-1)
                objects[i].favorite.push(user._id)
            await objects[i].save()
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;