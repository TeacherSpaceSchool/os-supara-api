const UserCantSyt = require('../models/userCantSyt');
const DivisionCantSyt = require('../models/divisionCantSyt');
const mongoose = require('mongoose')

const type = `
  type User {
    _id: ID
    createdAt: Date
    login: String
    name: String
    role: String
    status: String
    del: String
    GUID: String
    phone: String
  }
`;

const query = `
    users(search: String!, filter: String!, skip: Int): [User]
    usersTrash(search: String!): [User]
    user(_id: ID!): User
    heads: [User]
    suppliers: [User]
    staffs: [User]
    specialists: [User]
    filterUser: [Filter]
`;

const mutation = `
    addUser(login: String!, GUID: String, name: String!, role: String!, password: String!, phone: String): User
    setUser(_id: ID!, login: String, GUID: String, name: String, role: String, password: String, phone: String): Data
    deleteUser(_id: [ID]!): Data
    restoreUser(_id: [ID]!): Data
    onoffUser(_id: [ID]!): Data
`;

const resolvers = {
    usersTrash: async(parent, {search}, {user}) => {
        if(user.role==='admin'){
            let users = await UserCantSyt.find({
                del: 'deleted',
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {login: {'$regex': search, '$options': 'i'}},
                    {role: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort('name').lean()
            return users
        }
    },
    users: async(parent, {search, filter, skip}, {user}) => {
        let users = []
        if(['admin', 'менеджер'].includes(user.role)){
            users = await UserCantSyt.find({
                del: {$ne: 'deleted'},
                $and: [
                    {role: {$ne: 'admin'}},
                    {role: {'$regex': filter, '$options': 'i'}}
                ],
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {login: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort('name')
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 15 : 10000000000)
                .lean()
        }
        else {
            users = []
            let divisions =  await DivisionCantSyt.find({
                del: {$ne: 'deleted'},
                $or: [{head: user._id}, {suppliers: user._id}, {specialists: user._id}, {staffs:user._id}]
            })
                .select('head suppliers specialists staffs')
                .lean()
            for(let i = 0; i<divisions.length; i++) {
                users = [
                    ...users,
                    ...divisions[i].head?[divisions[i].head]:[],
                    ...divisions[i].suppliers?divisions[i].suppliers:[],
                    ...divisions[i].specialists?divisions[i].specialists:[],
                    ...divisions[i].staffs?divisions[i].staffs:[]]
            }
            users = await UserCantSyt.find({
                del: {$ne: 'deleted'},
                $and: [
                    {role: {$ne: 'admin'}},
                    {role: {'$regex': filter, '$options': 'i'}}
                ],
                name: {'$regex': search, '$options': 'i'},
                _id: {$in: users}
            })
                .sort('name')
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 15 : 10000000000)
                .lean()
        }
        return users
    },
    specialists: async() => {
        let users = await UserCantSyt.find({
            del: {$ne: 'deleted'},
            role: 'специалист'
        }).lean()
        return users
    },
    staffs: async() => {
        let users = await UserCantSyt.find({
            del: {$ne: 'deleted'},
            $and: [{role: {$ne: 'специалист'}}, {role: {$ne: 'снабженец'}}, {role: {$ne: 'начальник отдела'}}, {role: {$ne: 'admin'}}]
        }).lean()
        return users
    },
    suppliers: async() => {
        let users = await UserCantSyt.find({
            del: {$ne: 'deleted'},
            role: 'снабженец'
        }).lean()
        return users
    },
    heads: async() => {
        let users = await UserCantSyt.find({
            del: {$ne: 'deleted'},
            role: 'начальник отдела'
        }).lean()
        return users
    },
    user: async(parent, {_id}) => {
        if(mongoose.Types.ObjectId.isValid(_id)) {
            return await UserCantSyt.findOne({
                    _id: _id
            }).lean()
        }
        else return null
    },
    filterUser: async() => {
        let filters = [
            {
                name: 'Все',
                value: ''
            }
        ]
        let roles = await UserCantSyt.find({role: {$ne: 'admin'}}).distinct('role').lean()
        for(let i = 0; i<roles.length;i++) {
            filters.push({
                name: roles[i],
                value: roles[i]
            })
        }
        return await filters
    },
};

const resolversMutation = {
    addUser: async(parent, {login, GUID, name, role, password, phone}, {user}) => {
        if(['admin'].includes(user.role)) {
            let newUser = new UserCantSyt({
                login: login.trim(),
                role: role,
                status: 'active',
                password: password,
                name: name,
                GUID: GUID,
                phone: phone
            });
            newUser = await UserCantSyt.create(newUser);
            return newUser
        }
    },
    setUser: async(parent, {_id, GUID, login, name, role, password, phone}, {user}) => {
        if('admin'===user.role) {
            let object = await UserCantSyt.findById(_id)
            if(name) object.name = name
            if(password)object.password = password
            if(role)object.role = role
            if(login)object.login = login.trim()
            if(GUID)object.GUID = GUID
            if(phone)object.phone = phone
            await object.save();
        }
        return {data: 'OK'}
    },
    deleteUser: async(parent, { _id }, {user}) => {
        if(user.role==='admin') {
            await UserCantSyt.updateMany({_id: {$in: _id}}, {del: 'deleted'})
        }
        return {data: 'OK'}
    },
    restoreUser: async(parent, { _id }, {user}) => {
        if(user.role==='admin') {
            await UserCantSyt.updateMany({_id: {$in: _id}}, {del: null})
        }
        return {data: 'OK'}
    },
    onoffUser: async(parent, { _id }, {user}) => {
        let objects = await UserCantSyt.find({_id: {$in: _id}})
        for(let i=0; i<objects.length; i++){
            if('admin'===user.role) {
                objects[i].status = objects[i].status==='active'?'deactive':'active'
                await objects[i].save()
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