const PointShoro = require('../models/pointShoro');
const RegionShoro = require('../models/regionShoro');
const format = require('./const').stringifyDateTime;
const mongoose = require('mongoose');
const OrganizatorShoro = require('../models/organizatorShoro');
const skip1 = require('../module/const').skip;

const getPointShoroAll = async (id) => {
    let organizator = await OrganizatorShoro.findOne({user: id})
    let guidRegion = organizator.guidRegion
    let names = []
    let finds = await PointShoro
        .find({guidRegion: {'$regex': guidRegion, '$options': 'i'}})
    for(let i=0; i<finds.length; i++){
        names.push({name: finds[i].name, guid: finds[i].guid})
    }
    return names.sort();

}

const getPointShoro1 = async (search, sort, skip, id) => {
        let findResult = [], data = [], count;
        const row = [
            'название',
            'регион',
            'создан'
        ];
        let organizator = await OrganizatorShoro.findOne({user: id})
        let guidRegion = organizator.guidRegion
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
                guidRegion: {'$regex': guidRegion, '$options': 'i'},
            });
            findResult = await PointShoro
                .find({
                    guidRegion: {'$regex': guidRegion, '$options': 'i'},
                })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await PointShoro.count({
                guidRegion: {'$regex': guidRegion, '$options': 'i'},
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                guidRegion: {'$regex': guidRegion, '$options': 'i'},
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
                guidRegion: {'$regex': guidRegion, '$options': 'i'},
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                guidRegion: {'$regex': guidRegion, '$options': 'i'},
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
            count = await PointShoro.count({guidRegion: {'$regex': region, '$options': 'i'}});
            findResult = await PointShoro
                .find({guidRegion: {'$regex': region, '$options': 'i'}})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await PointShoro.count({
                guidRegion: {'$regex': region, '$options': 'i'},
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                guidRegion: {'$regex': region, '$options': 'i'},
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
                guidRegion: {'$regex': region, '$options': 'i'},
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PointShoro.find({
                guidRegion: {'$regex': region, '$options': 'i'},
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
        /*let _object = new PointShoro(object);
        await PointShoro.create(_object);*/
}

const setPointShoro = async (object, id) => {
        /*await RealizatorShoro.findOneAndUpdate({point: id, region: object.region}, {$set: {point: object.name}});
        await PointShoro.findOneAndUpdate({name: id, region: object.region}, {$set: object});*/
}

const deletePointShoro = async (id) => {
        /*for(let i=0; i<id.length; i++){
            await PointShoro.deleteMany({name: {$in: id[i].split('|')[0]}, region: {$in: id[i].split('|')[1]}});
        }*/
}

const getPointWithRegion = async () => {
    let pointsWithRegion = {}
    let namesRegions = []
    let findRegions = await RegionShoro.find();
    for(let i=0; i<findRegions.length; i++){
        namesRegions.push({name: findRegions[i].name, guid: findRegions[i].guid})
    }
    namesRegions = namesRegions.sort()
    for(let i =0; i<namesRegions.length; i++){
        pointsWithRegion[namesRegions[i].guid] = [];
        let findPoints = await PointShoro.find({guidRegion: namesRegions[i].guid})
        for(let i1=0; i1<findPoints.length; i1++){
            pointsWithRegion[namesRegions[i].guid].push({name: findPoints[i1].name, guid: findPoints[i1].guid})
        }
    }
    return pointsWithRegion;
}

const getPointShoroName = async () => {
    let names = []
    let finds = await PointShoro
        .find()
    for(let i=0; i<finds.length; i++){
        names.push({name: finds[i].name, guid: finds[i].guid})
    }
    return names.sort();
}

const getPointShoroRegion = async (region) => {
    let names = []
    let finds = await PointShoro.find({guidRegion: {'$regex': region, '$options': 'i'}})
    for(let i=0; i<finds.length; i++){
        names.push({name: finds[i].name, guid: finds[i].guid})
    }
    return names.sort()
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