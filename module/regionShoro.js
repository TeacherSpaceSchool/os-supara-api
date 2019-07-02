const RegionShoro = require('../models/regionShoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const RealizatorShoro = require('../models/realizatorShoro');
const PointShoro = require('../models/pointShoro');
const format = require('./const').stringifyDateTime
const mongoose = require('mongoose');
const skip1 = require('../module/const').skip;

const getRegionShoro = async (search, sort, skip) => {
        let findResult = [], data = [], count;
        const row = [
            'название',
            'создан'
        ];
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='название'&&sort[1]=='descending')
            sort = '-name';
        else if(sort[0]=='название'&&sort[1]=='ascending')
            sort = 'name';
        else if(sort[0]=='создан'&&sort[1]=='descending')
            sort = '-updatedAt';
        else if(sort[0]=='создан'&&sort[1]=='ascending')
            sort = 'updatedAt';
        if(search == ''){
            count = await RegionShoro.count();
            findResult = await RegionShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await RegionShoro.count({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await RegionShoro.find({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else {
            count = await RegionShoro.count({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await RegionShoro.find({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        }
        for (let i=0; i<findResult.length; i++){
            data.push([ findResult[i].name, format(findResult[i].updatedAt)]);
        }
        return {data: data, count: count, row: row}
}

const addRegionShoro = async (object) => {
        let _object = new RegionShoro(object);
        await RegionShoro.create(_object);

}

const setRegionShoro = async (object, id) => {
        await OrganizatorShoro.updateMany({region: id}, {$set: {region: object.name}});
        await RealizatorShoro.updateMany({region: id}, {$set: {region: object.name}});
        await PointShoro.updateMany({region: id}, {$set: {region: object.name}});
        await RegionShoro.updateMany({name: id}, {$set: object});

}

const deleteRegionShoro = async (id) => {
        await RegionShoro.deleteMany({name: {$in: id}});

}

const getRegionShoroName = async () => {
    let a = await RegionShoro.find().distinct('name');
    return a.sort()

}

module.exports.deleteRegionShoro = deleteRegionShoro;
module.exports.getRegionShoro = getRegionShoro;
module.exports.setRegionShoro = setRegionShoro;
module.exports.getRegionShoroName = getRegionShoroName;
module.exports.addRegionShoro = addRegionShoro;