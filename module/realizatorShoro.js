const RealizatorShoro = require('../models/realizatorShoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const UserShoro = require('../models/userShoro');
const mongoose = require('mongoose');


const getRealizatorShoro1 = async (search, sort, skip, id) => {
    try{
        let findResult = [], data = [], count;
        const row = [
            'имя',
            'точка',
            'регион',
        ];
        let organizator = await OrganizatorShoro.findOne({user: id})
        let region = organizator.region
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='имя'&&sort[1]=='descending')
            sort = '-name';
        else if(sort[0]=='имя'&&sort[1]=='ascending')
            sort = 'name';
        else if(sort[0]=='точка'&&sort[1]=='descending')
            sort = '-point';
        else if(sort[0]=='точка'&&sort[1]=='ascending')
            sort = 'point';
        else if(sort[0]=='регион'&&sort[1]=='descending')
            sort = '-region';
        else if(sort[0]=='регион'&&sort[1]=='ascending')
            sort = 'region';
        else if(sort[0]=='статус'&&sort[1]=='descending')
            sort = '-status';
        else if(sort[0]=='статус'&&sort[1]=='ascending')
            sort = 'status';
        if(search == ''){
            count = await RealizatorShoro.count();
            findResult = await RealizatorShoro
                .find({region: region})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await RealizatorShoro.count({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}}
                ],
                region: region
            });
            findResult = await RealizatorShoro.find({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}}
                ],
                region: region
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        } else {
            count = await RealizatorShoro.count({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}}
                ],
                region: region
            });
            findResult = await RealizatorShoro.find({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}}
                ],
                region: region
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].name, findResult[i].point, findResult[i].region, findResult[i].phone]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const getRealizatorShoro = async (search, sort, skip) => {
    try{
        let findResult = [], data = [], count;
        const row = [
            'имя',
            'точка',
            'регион',
        ];
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='имя'&&sort[1]=='descending')
            sort = '-name';
        else if(sort[0]=='имя'&&sort[1]=='ascending')
            sort = 'name';
        else if(sort[0]=='точка'&&sort[1]=='descending')
            sort = '-point';
        else if(sort[0]=='точка'&&sort[1]=='ascending')
            sort = 'point';
        else if(sort[0]=='регион'&&sort[1]=='descending')
            sort = '-region';
        else if(sort[0]=='регион'&&sort[1]=='ascending')
            sort = 'region';
        else if(sort[0]=='статус'&&sort[1]=='descending')
            sort = '-status';
        else if(sort[0]=='статус'&&sort[1]=='ascending')
            sort = 'status';
        if(search == ''){
            count = await RealizatorShoro.count();
            findResult = await RealizatorShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await RealizatorShoro.count({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}}
                ]
            });
            findResult = await RealizatorShoro.find({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}}
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        } else {
            count = await RealizatorShoro.count({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}}
                ]
            });
            findResult = await RealizatorShoro.find({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}}
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].name, findResult[i].point, findResult[i].region, findResult[i].phone]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const getRealizatorShoroById = async (id) => {
    try{
        let object = await RealizatorShoro.findOne({user: id});
        let user = await UserShoro.findOne({_id: object.user})
        let organizator = await OrganizatorShoro.findOne({region: object.region});
        let res = {
            status: user.status,
            name: object.name,
            organizator: organizator.name,
            phone: object.phone,
            region: object.region,
            point: object.point,
            _id: object._id,
            user: object.user,
        }
        return res
    } catch(error) {
        console.error(error)
    }
}

const addRealizatorShoro = async (object) => {
    try{
        let _user = new UserShoro({
            email: object.phone,
            role: 'реализатор',
            status: object.status,
            password: object.password,
        });
        const user = await UserShoro.create(_user);
        let _object = new RealizatorShoro({
            name: object.name,
            phone: object.phone,
            point: object.point,
            region: object.region,
            user: user._id
        });
        await RealizatorShoro.create(_object);
    } catch(error) {
        console.error(error)
    }
}

const getRealizatorShoroByName = async (name, point, region, phone) => {
    try{
        let object = await RealizatorShoro.findOne({name: name, region: region, point: point, phone: phone});
        let user = await UserShoro.findOne({_id: object.user})
        let res = {
            status: user.status,
            name: object.name,
            phone: object.phone,
            region: object.region,
            point: object.point,
            _id: object._id,
            user: object.user,
        }
        return res
    } catch(error) {
        console.error(error)
    }
}

const setRealizatorShoro = async (object, id) => {
    try{
        if(object.password!==undefined&&object.password.length>0) {
            let user = await UserShoro.findById({_id: object.user});
            user.email = object.phone;
            user.status = object.status;
            user.password = object.password;
            await user.save();
            await RealizatorShoro.findOneAndUpdate({_id: id}, {$set: object});
        } else {
            await UserShoro.findOneAndUpdate({_id: object.user}, {$set: { email: object.phone, status: object.status}});
            await RealizatorShoro.findOneAndUpdate({_id: id}, {$set: object});
        }
    } catch(error) {
        console.error(error)
    }
}

const deleteRealizatorShoro = async (id) => {
    try{
        for(let i=0; i<id.length; i++){
            let object = await RealizatorShoro.findOne({phone: id})
            await UserShoro.deleteMany({_id: {$in: object.user}});
            await RealizatorShoro.deleteMany({phone: id});
        }
    } catch(error) {
        console.error(error)
    }
}

module.exports.deleteRealizatorShoro = deleteRealizatorShoro;
module.exports.getRealizatorShoro = getRealizatorShoro;
module.exports.getRealizatorShoro1 = getRealizatorShoro1;
module.exports.setRealizatorShoro = setRealizatorShoro;
module.exports.addRealizatorShoro = addRealizatorShoro;
module.exports.getRealizatorShoroByName = getRealizatorShoroByName;
module.exports.getRealizatorShoroById = getRealizatorShoroById;