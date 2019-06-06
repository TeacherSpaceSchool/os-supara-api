const RegionShoro = require('../models/regionShoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const RealizatorShoro = require('../models/realizatorShoro');
const PointShoro = require('../models/pointShoro');
const format = require('./const').stringifyDateTime
const mongoose = require('mongoose');

const getRegionShoro = async (search, sort, skip) => {
    try{
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
                .limit(10)
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
                .limit(10)
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
                .limit(10)
        }
        for (let i=0; i<findResult.length; i++){
            data.push([ findResult[i].name, format(findResult[i].updatedAt)]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const addRegionShoro = async (object) => {
    try{
        let _object = new RegionShoro(object);
        await RegionShoro.create(_object);
    } catch(error) {
        console.error(error)
    }
}

const setRegionShoro = async (object, id) => {
    try{
        await OrganizatorShoro.updateMany({region: id}, {$set: {region: object.name}});
        await RealizatorShoro.updateMany({region: id}, {$set: {region: object.name}});
        await PointShoro.updateMany({region: id}, {$set: {region: object.name}});
        await RegionShoro.updateMany({name: id}, {$set: object});
    } catch(error) {
        console.error(error)
    }
}

const deleteRegionShoro = async (id) => {
    try{
        await RegionShoro.deleteMany({name: {$in: id}});
    } catch(error) {
        console.error(error)
    }
}

const getRegionShoroName = async () => {
    try{
        return await RegionShoro.find().distinct('name');
    } catch(error) {
        console.error(error)
    }
}

module.exports.deleteRegionShoro = deleteRegionShoro;
module.exports.getRegionShoro = getRegionShoro;
module.exports.setRegionShoro = setRegionShoro;
module.exports.getRegionShoroName = getRegionShoroName;
module.exports.addRegionShoro = addRegionShoro;