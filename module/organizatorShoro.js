const OrganizatorShoro = require('../models/organizatorShoro');
const UserShoro = require('../models/userShoro');
const skip1 = require('../module/const').skip;
const mongoose = require('mongoose');

const getOrganizatorShoroName = async () => {
    let names = []
    let finds = await OrganizatorShoro
        .find()
    for(let i=0; i<finds.length; i++){
        names.push({name: finds[i].name, guid: finds[i].guid})
    }
    return names.sort();
}

const getOrganizatorShoro = async (search, sort, skip) => {
        let findResult = [], data = [], count;
        const row = [
            'имя',
            'регион',
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
        if(search == ''){
            count = await OrganizatorShoro.count();
            findResult = await OrganizatorShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await OrganizatorShoro.count({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}}
                ]
            });
            findResult = await OrganizatorShoro.find({
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
            count = await OrganizatorShoro.count({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {phone: {'$regex': search, '$options': 'i'}},
                    {inn: {'$regex': search, '$options': 'i'}},
                    {address: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}}
                ]
            });
            findResult = await OrganizatorShoro.find({
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
            data.push([findResult[i].name, findResult[i].region, findResult[i].phone, findResult[i].guid, findResult[i].guidRegion]);
        }
        return {data: data, count: count, row: row}

}

const addOrganizatorShoro = async (object) => {
        /*if(object.region==='Резерв'||await OrganizatorShoro.count({region: object.region})===0){
            let _user = new UserShoro({
                email: object.phone,
                role: 'организатор',
                status: object.status,
                password: object.password,
            });
            const user = await UserShoro.create(_user);
            let _object = new OrganizatorShoro({
                name: object.name,
                phone: object.phone,
                region: object.region,
                user: user._id
            });
            await OrganizatorShoro.create(_object);
        }*/

}

const setOrganizatorShoro = async (object, id) => {
    let  aprove = false;
    let find = await OrganizatorShoro.find({guidRegion: object.guidRegion});
    aprove = object.region==='Резерв'||find.length===0||(find.length==1&&find[0]._id==id)
    if(aprove) {
        if (object.password !== undefined && object.password.length > 0) {
            let user = await UserShoro.findById({_id: object.user});
            user.email = object.phone;
            user.status = object.status;
            user.password = object.password;
            await user.save();
            await OrganizatorShoro.findOneAndUpdate({_id: id}, {$set: object});
        } else {
            await UserShoro.findOneAndUpdate({_id: object.user}, {$set: {email: object.phone, status: object.status}});
            await OrganizatorShoro.findOneAndUpdate({_id: id}, {$set: object});
        }
    }
}

const getOrganizatorShoroById = async (id) => {
        let object = await OrganizatorShoro.findOne({user: id});
        let user = await UserShoro.findOne({_id: object.user})
        let res = {
            status: user.status,
            name: object.name,
            phone: object.phone,
            region: object.region,
            guidRegion: object.guidRegion,
            guid: object.guid,
            _id: object._id,
            user: object.user,
        }
        return res

}

const getOrganizatorShoroByName = async (phone) => {
        let object = await OrganizatorShoro.findOne({phone: phone});
        let user = await UserShoro.findOne({_id: object.user})
        let res = {
            status: user.status,
            name: object.name,
            phone: object.phone,
            region: object.region,
            guidRegion: object.guidRegion,
            _id: object._id,
            user: object.user,
        }
        return res

}

const deleteOrganizatorShoro = async (id) => {
       /* for(let i=0; i<id.length; i++){
            let object = await OrganizatorShoro.findOne({phone: id[i]})
            await UserShoro.deleteMany({_id: {$in: object.user}});
            await OrganizatorShoro.deleteMany({phone: id[i]});
        }
*/
}

const getProfileOrganizatorShoro = async (id) => {
        let object = await OrganizatorShoro.findOne({user: id});
        let user = await UserShoro.findOne({_id: object.user})
        let res = {
            status: user.status,
            name: object.name,
            phone: object.phone,
            region: object.region,
            guidRegion: object.guidRegion,
            guid: object.guid,
            _id: object._id,
            user: object.user,
        }
        return res

}

module.exports.deleteOrganizatorShoro = deleteOrganizatorShoro;
module.exports.getOrganizatorShoroByName = getOrganizatorShoroByName;
module.exports.getOrganizatorShoro = getOrganizatorShoro;
module.exports.setOrganizatorShoro = setOrganizatorShoro;
module.exports.addOrganizatorShoro = addOrganizatorShoro;
module.exports.getOrganizatorShoroById = getOrganizatorShoroById
module.exports.getOrganizatorShoroName = getOrganizatorShoroName
module.exports.getProfileOrganizatorShoro = getProfileOrganizatorShoro