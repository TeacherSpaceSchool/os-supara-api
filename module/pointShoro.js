const PointShoro = require('../models/pointShoro');
const RegionShoro = require('../models/regionShoro');
const format = require('./const').stringifyDateTime
const mongoose = require('mongoose');
const RealizatorShoro = require('../models/realizatorShoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const skip1 = require('../module/const').skip;

const getPointShoroAll = async (id) => {
        let organizator = await OrganizatorShoro.findOne({user: id})
        let region = organizator.region
        let a = await PointShoro
            .find({region: {'$regex': region, '$options': 'i'}})
            .distinct('name')
        return a.sort();

}

const getPointShoro1 = async (search, sort, skip, id) => {
        let findResult = [], data = [], count;
        const row = [
            'название',
            'регион',
            'создан'
        ];
        let organizator = await OrganizatorShoro.findOne({user: id})
        let region = organizator.region
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='название'&&sort[1]=='descending')
            sort = '-name';
        else if(sort[0]=='название'&&sort[1]=='ascending')
            sort = 'name';
        else if(sort[0]=='регион'&&sort[1]=='descending')
            sort = '-region';
        else if(sort[0]=='регион'&&sort[1]=='ascending')
            sort = 'region';
        else if(sort[0]=='создан'&&sort[1]=='descending')
            sort = '-updatedAt';
        else if(sort[0]=='создан'&&sort[1]=='ascending')
            sort = 'updatedAt';
        if(search == ''){
            count = await PointShoro.count({
                region: {'$regex': region, '$options': 'i'},
            });
            findResult = await PointShoro
                .find({
                    region: {'$regex': region, '$options': 'i'},
                })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await PointShoro.count({
            region: {'$regex': region, '$options': 'i'},
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                region: {'$regex': region, '$options': 'i'},
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else {
            count = await PointShoro.count({
                region: {'$regex': region, '$options': 'i'},
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                region: {'$regex': region, '$options': 'i'},
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                 ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        }
        for (let i=0; i<findResult.length; i++){
            data.push([ findResult[i].name, findResult[i].region, format(findResult[i].updatedAt)]);
        }
        return {data: data, count: count, row: row}
}

const getPointShoro = async (search, sort, skip, region) => {
        let findResult = [], data = [], count;
        const row = [
            'название',
            'регион',
            'создан'
        ];
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='название'&&sort[1]=='descending')
            sort = '-name';
        else if(sort[0]=='название'&&sort[1]=='ascending')
            sort = 'name';
        else if(sort[0]=='регион'&&sort[1]=='descending')
            sort = '-region';
        else if(sort[0]=='регион'&&sort[1]=='ascending')
            sort = 'region';
        else if(sort[0]=='создан'&&sort[1]=='descending')
            sort = '-updatedAt';
        else if(sort[0]=='создан'&&sort[1]=='ascending')
            sort = 'updatedAt';
        if(search == ''){
            count = await PointShoro.count({region: {'$regex': region, '$options': 'i'}});
            findResult = await PointShoro
                .find({region: {'$regex': region, '$options': 'i'}})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await PointShoro.count({
                region: {'$regex': region, '$options': 'i'},
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                region: {'$regex': region, '$options': 'i'},
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else {
            count = await PointShoro.count({
                region: {'$regex': region, '$options': 'i'},
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                region: {'$regex': region, '$options': 'i'},
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        }
        for (let i=0; i<findResult.length; i++){
            data.push([ findResult[i].name, findResult[i].region, format(findResult[i].updatedAt)]);
        }
        return {data: data, count: count, row: row}
}

const addPointShoro = async (object) => {
        let _object = new PointShoro(object);
        await PointShoro.create(_object);
}

const setPointShoro = async (object, id) => {
        await RealizatorShoro.findOneAndUpdate({point: id, region: object.region}, {$set: {point: object.name}});
        await PointShoro.findOneAndUpdate({name: id, region: object.region}, {$set: object});
}

const deletePointShoro = async (id) => {
        for(let i=0; i<id.length; i++){
            await PointShoro.deleteMany({name: {$in: id[i].split('|')[0]}, region: {$in: id[i].split('|')[1]}});
        }
}

const getPointWithRegion = async () => {
        let pointsWithRegion = {}
        let regions = await RegionShoro.find().distinct('name');
        regions = regions.sort()

        for(let i =0; i<regions.length; i++){
            pointsWithRegion[regions[i]] = await PointShoro.find({region: regions[i]}).distinct('name')
        }

        return pointsWithRegion;
}

const getPointShoroName = async () => {
    let a = await PointShoro.find().distinct('name');
    return a.sort()
}

const getPointShoroRegion = async (region) => {
    let a = await PointShoro.find({region: {'$regex': region, '$options': 'i'}}).distinct('name');
    return a.sort()
}

module.exports.deletePointShoro = deletePointShoro;
module.exports.getPointWithRegion = getPointWithRegion;
module.exports.getPointShoro = getPointShoro;
module.exports.getPointShoro1 = getPointShoro1;
module.exports.setPointShoro = setPointShoro;
module.exports.addPointShoro = addPointShoro;
module.exports.getPointShoroName = getPointShoroName;
module.exports.getPointShoroRegion = getPointShoroRegion;
module.exports.getPointShoroAll = getPointShoroAll;