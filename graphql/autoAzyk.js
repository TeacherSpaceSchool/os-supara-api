const AutoAzyk = require('../models/autoAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const mongoose = require('mongoose')

const type = `
  type Auto {
    _id: ID
    number: String
    tonnage: Float
    size: Float
    employment: Employment
    organization: Organization
    createdAt: Date
  }
`;

const query = `
    autos(search: String!, sort: String!, filter: String!): [Auto]
    auto(_id: ID!): Auto
    autoByEcspeditor(_id: ID!): Auto
    sortAuto: [Sort]
    filterAuto: [Filter]
`;

const mutation = `
    addAuto(number: String!, tonnage: Float!, size: Float!, employment: ID, organization: ID): Data
    setAuto(_id: ID!, number: String, tonnage: Float, size: Float, organization: ID, employment: ID): Data
    deleteAuto(_id: [ID]!): Data
`;

const resolvers = {
    autos: async(parent, {search, sort, filter}, {user}) => {
        if(user.role==='admin'){
            let autos =  await AutoAzyk.find(
                mongoose.Types.ObjectId.isValid(filter)?{organization: filter}:{}
            )
                .populate('employment')
                .populate('organization')
                .sort(sort)
            autos = autos.filter(
                auto => (
                    (auto.number.toLowerCase()).includes(search.toLowerCase()) ||
                    (auto.size.toString().toLowerCase()).includes(search.toLowerCase()) ||
                    (auto.tonnage.toString().toLowerCase()).includes(search.toLowerCase()) ||
                    auto.organization&&(auto.organization.name.toLowerCase()).includes(search.toLowerCase()) ||
                    auto.employment&&(auto.employment.name.toLowerCase()).includes(search.toLowerCase())
                )
            )
            return autos
        }
        else if(['организация', 'менеджер'].includes(user.role)){
            let autos =  await AutoAzyk.find(
                mongoose.Types.ObjectId.isValid(filter)?{employment: filter, organization: user.organization}:{organization: user.organization}
            )
                .populate('employment')
                .populate('organization')
                .sort(sort)
            autos = autos.filter(
                auto => (
                    (auto.number.toLowerCase()).includes(search.toLowerCase()) ||
                    (auto.size.toString().toLowerCase()).includes(search.toLowerCase()) ||
                    (auto.tonnage.toString().toLowerCase()).includes(search.toLowerCase()) ||
                    auto.employment&&(auto.employment.name.toLowerCase()).includes(search.toLowerCase())
                )
            )
            return autos
        }
    },
    auto: async(parent, {_id}, {user}) => {
        let auto = await AutoAzyk.findOne({$or: [{_id: _id}, {employment: _id}]})
            .populate('employment')
            .populate('organization')
        if(user.role==='admin'||user.organization.toString()===auto.organization._id.toString())
            return auto
        else
            return null
    },
    sortAuto: async() => {
        return [
            {
                name: 'Имя',
                field: 'name'
            },
            {
                name: 'Дата',
                field: '-createdAt'
            },
        ]
    },
    filterAuto: async(parent, ctx, {user}) => {
        if(['admin'].includes(user.role)){
            let filter = [
                {
                    name: 'Все',
                    value: ''
                }
            ]
            let objects = await AutoAzyk.find().distinct('organization')
            objects = await OrganizationAzyk.find({_id: {$in: objects}})
            for(let i = 0; i<objects.length; i++){
                filter = [
                    ... filter,
                    {
                        name: objects[i].name,
                        value: objects[i]._id
                    }
                ]
            }
            return filter
        }
        else if(user.role){
            let filter = [
                {
                    name: 'Все',
                    value: ''
                }
            ]
            let objects = await AutoAzyk.find().distinct('employment')
            objects = await EmploymentAzyk.find({_id: {$in: objects}})
            for(let i = 0; i<objects.length; i++){
                filter = [
                    ... filter,
                    {
                        name: objects[i].name,
                        value: objects[i]._id
                    }
                ]
            }
            return filter
        }
        else
            return []
    },
};

const resolversMutation = {
    addAuto: async(parent, {number, tonnage, size, organization, employment}, {user}) => {
        if(['admin', 'организация'].includes(user.role)){
            let _object = new AutoAzyk({
                number: number,
                tonnage: (tonnage).toFixed(2),
                size: (size).toFixed(2)
            });
            if(employment)_object.employment = employment
            if(user.role==='admin')
                _object.organization = organization
            else
                _object.organization = user.organization
            await AutoAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setAuto: async(parent, {_id, number, tonnage, size, organization, employment}, {user}) => {
        if(['admin', 'организация'].includes(user.role)) {
            let object = await AutoAzyk.findById(_id)
            if(number)object.number = number
            if(tonnage)object.tonnage = tonnage
            if(size)object.size = size
            if(employment)object.employment = employment
            if(organization&&user.role==='admin')object.organization = organization
            object.save();
        }
        return {data: 'OK'}
    },
    deleteEquipment: async(parent, { _id }, {user}) => {
        if(['admin', 'организация'].includes(user.role)){
            let objects = await AutoAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                if(user.role==='admin'||user.organization.toString()===objects[i].organization.toString())
                    await AutoAzyk.deleteOne({_id: objects[i]._id})
            }
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;