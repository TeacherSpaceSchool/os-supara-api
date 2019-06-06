const NakladnayaSklad2Shoro = require('../models/nakladnayaSklad2Shoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const mongoose = require('mongoose');

const getNakladnayaSklad2ShoroOrganizator = async (search, sort, skip, id) => {
    try{
        let findResult = [], data = [], count;
        const row = [
            'организатор',
            'дата',
        ];
        let organizator = await OrganizatorShoro.findOne({user: id})
        let region = organizator.region
        organizator = organizator.name
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='дата'&&sort[1]=='descending')
            sort = '-data';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'data';
        if(search == ''){
            count = await NakladnayaSklad2Shoro.count({organizator: organizator, region: region});
            findResult = await NakladnayaSklad2Shoro
                .find({organizator: organizator, region: region})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaSklad2Shoro.count({
                organizator: organizator, region: region,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad2Shoro.find({
                organizator: organizator, region: region,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        } else {
            count = await NakladnayaSklad2Shoro.count({
                organizator: organizator, region: region,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad2Shoro.find({
                organizator: organizator, region: region,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].organizator + ': ' + findResult[i].region, findResult[i].data]);
        }
        console.log(data)
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const getNakladnayaSklad2Shoro = async (search, sort, skip) => {
    try{
        let findResult = [], data = [], count;
        const row = [
            'организатор',
            'дата',
        ];
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='организатор'&&sort[1]=='descending')
            sort = '-organizator';
        else if(sort[0]=='организатор'&&sort[1]=='ascending')
            sort = 'organizator';
        else if(sort[0]=='дата'&&sort[1]=='descending')
            sort = '-data';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'data';
        if(search == ''){
            count = await NakladnayaSklad2Shoro.count();
            findResult = await NakladnayaSklad2Shoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaSklad2Shoro.count({
                $or: [
                    {_id: search},
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad2Shoro.find({
                $or: [
                    {_id: search},
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        } else {
            count = await NakladnayaSklad2Shoro.count({
                $or: [
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad2Shoro.find({
                $or: [
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].organizator + ': ' + findResult[i].region, findResult[i].data]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const addNakladnayaSklad2Shoro = async (object) => {
    try{
        if(await NakladnayaSklad2Shoro.findOne({data: object.data, organizator: object.organizator, region: object.region})===null){
            let _object = new NakladnayaSklad2Shoro(object);
            await NakladnayaSklad2Shoro.create(_object);
        }
    } catch(error) {
        console.error(error)
    }
}

const getNakladnayaSklad2ShoroByData = async (data, organizator, region) => {
    try{
        return(await NakladnayaSklad2Shoro.findOne({data: data, organizator: organizator, region: region}))
    } catch(error) {
        console.error(error)
    }
}

const setNakladnayaSklad2Shoro = async (object, id) => {
    try{
        await NakladnayaSklad2Shoro.findOneAndUpdate({_id: id}, {$set: object});
    } catch(error) {
        console.error(error)
    }
}

const deleteNakladnayaSklad2Shoro = async (id) => {
    try{
        for(let i=0; i<id.length; i++){
            let id1 = id[i].split('|')
            id1[0] = id1[1].split(': ')[0]
            id1[1] = id1[1].split(': ')[1]
            await NakladnayaSklad2Shoro.deleteMany({data: id1[2],
                organizator: id1[0],
                region: id1[1]})

        }
    } catch(error) {
        console.error(error)
    }
}

module.exports.deleteNakladnayaSklad2Shoro = deleteNakladnayaSklad2Shoro;
module.exports.getNakladnayaSklad2Shoro = getNakladnayaSklad2Shoro;
module.exports.setNakladnayaSklad2Shoro = setNakladnayaSklad2Shoro;
module.exports.addNakladnayaSklad2Shoro = addNakladnayaSklad2Shoro;
module.exports.getNakladnayaSklad2ShoroOrganizator = getNakladnayaSklad2ShoroOrganizator;
module.exports.getNakladnayaSklad2ShoroByData = getNakladnayaSklad2ShoroByData;