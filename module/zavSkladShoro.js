const ZavSkladShoro = require('../models/zavSkladShoro');
const mongoose = require('mongoose');
const UserShoro = require('../models/userShoro');
const skip1 = require('../module/const').skip;

const getZavSkladShoro = async (search, sort, skip) => {
    try{
        //await ZavSkladShoro.deleteMany()
        let findResult = [], data = [], count;
        const row = [
            'имя'
        ];
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='имя'&&sort[1]=='descending')
            sort = '-name';
        else if(sort[0]=='имя'&&sort[1]=='ascending')
            sort = 'name';
        else if(sort[0]=='регион'&&sort[1]=='descending')
            sort = '-region';
        else if(sort[0]=='регион'&&sort[1]=='ascending')
            sort = 'region';
        else if(sort[0]=='телефон'&&sort[1]=='descending')
            sort = '-phone';
        else if(sort[0]=='телефон'&&sort[1]=='ascending')
            sort = 'phone';
        else if(sort[0]=='ИНН'&&sort[1]=='descending')
            sort = '-inn';
        else if(sort[0]=='ИНН'&&sort[1]=='ascending')
            sort = 'inn';
        else if(sort[0]=='адрес'&&sort[1]=='descending')
            sort = '-address';
        else if(sort[0]=='адрес'&&sort[1]=='ascending')
            sort = 'address';
        else if(sort[0]=='статус'&&sort[1]=='descending')
            sort = '-status';
        else if(sort[0]=='статус'&&sort[1]=='ascending')
            sort = 'status';
        else if(sort[0]=='создан'&&sort[1]=='descending')
            sort = '-updatedAt';
        else if(sort[0]=='создан'&&sort[1]=='ascending')
            sort = 'updatedAt';
        if(search == ''){
            count = await ZavSkladShoro.count();
            findResult = await ZavSkladShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await ZavSkladShoro.count({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}}
                ]
            });
            findResult = await ZavSkladShoro.find({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}}
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        } else {
            count = await ZavSkladShoro.count({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}}
                ]
            });
            findResult = await ZavSkladShoro.find({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}}
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].name, findResult[i].phone]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const addZavSkladShoro = async (object) => {
    try{
        let _user = new UserShoro({
            email: object.phone,
            role: 'завсклада',
            status: 'active',
            password: object.password,
        });
        const user = await UserShoro.create(_user);
        let _object = new ZavSkladShoro({
            name: object.name,
            phone: object.phone,
            user: user._id
        });
        await ZavSkladShoro.create(_object);
    } catch(error) {
        console.error(error)
    }
}

const getZavSkladShoroByName = async (phone) => {
    try{
        let object = await ZavSkladShoro.findOne({phone: phone});
        let user = await UserShoro.findOne({_id: object.user})
        let res = {
            status: user.status,
            name: object.name,
            phone: object.phone,
            _id: object._id,
            user: object.user,
        }
        return res
    } catch(error) {
        console.error(error)
    }
}

const setZavSkladShoro = async (object, id) => {
    if(object.password!==undefined&&object.password.length>0) {
        let user = await UserShoro.findById({_id: object.user});
        user.email = object.phone;
        user.status = object.status;
        user.password = object.password;
        await user.save();
        await ZavSkladShoro.findOneAndUpdate({_id: id}, {$set: object});
    } else {
        await UserShoro.findOneAndUpdate({_id: object.user}, {$set: { email: object.phone, status: object.status}});
        await ZavSkladShoro.findOneAndUpdate({_id: id}, {$set: object});
    }
}

const deleteZavSkladShoro = async (id) => {
    try{
        for(let i=0; i<id.length; i++){
            let object = await ZavSkladShoro.findOne({phone: id[i]})
            await UserShoro.deleteMany({_id: {$in: object.user}});
            await ZavSkladShoro.deleteMany({phone: id[i]});
        }
    } catch(error) {
        console.error(error)
    }
}

module.exports.deleteZavSkladShoro = deleteZavSkladShoro;
module.exports.getZavSkladShoro = getZavSkladShoro;
module.exports.setZavSkladShoro = setZavSkladShoro;
module.exports.addZavSkladShoro = addZavSkladShoro;
module.exports.getZavSkladShoroByName = getZavSkladShoroByName;