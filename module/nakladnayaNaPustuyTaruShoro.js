const NakladnayaNaPustuyTaruShoro = require('../models/nakladnayaNaPustuyTaruShoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const skip1 = require('../module/const').skip;
const mongoose = require('mongoose');

const getNakladnayaNaPustuyTaruShoroOrganizator = async (search, sort, skip, id) => {
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
            count = await NakladnayaNaPustuyTaruShoro.count({organizator: organizator, region: region});
            findResult = await NakladnayaNaPustuyTaruShoro
                .find({organizator: organizator, region: region})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaNaPustuyTaruShoro.count({
                organizator: organizator, region: region,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaPustuyTaruShoro.find({
                organizator: organizator, region: region,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        } else {
            count = await NakladnayaNaPustuyTaruShoro.count({
                organizator: organizator, region: region,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaPustuyTaruShoro.find({
                organizator: organizator, region: region,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
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

const getNakladnayaNaPustuyTaruShoro = async (search, sort, skip) => {
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
            count = await NakladnayaNaPustuyTaruShoro.count();
            findResult = await NakladnayaNaPustuyTaruShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaNaPustuyTaruShoro.count({
                $or: [
                    {_id: search},
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaPustuyTaruShoro.find({
                $or: [
                    {_id: search},
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        } else {
            count = await NakladnayaNaPustuyTaruShoro.count({
                $or: [
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaPustuyTaruShoro.find({
                $or: [
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].organizator + ': ' + findResult[i].region, findResult[i].data]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const addNakladnayaNaPustuyTaruShoro = async (object) => {
    try{
        if(await NakladnayaNaPustuyTaruShoro.findOne({data: object.data, organizator: object.organizator, region: object.region})===null){
            let _object = new NakladnayaNaPustuyTaruShoro(object);
            await NakladnayaNaPustuyTaruShoro.create(_object);
        }
    } catch(error) {
        console.error(error)
    }
}

const getNakladnayaNaPustuyTaruShoroByData = async (data, organizator, region) => {
    try{
        return(await NakladnayaNaPustuyTaruShoro.findOne({data: data, organizator: organizator, region: region}))
    } catch(error) {
        console.error(error)
    }
}

const setNakladnayaNaPustuyTaruShoro = async (object, id) => {
    try{
        await NakladnayaNaPustuyTaruShoro.findOneAndUpdate({_id: id}, {$set: object});
    } catch(error) {
        console.error(error)
    }
}

const deleteNakladnayaNaPustuyTaruShoro = async (id) => {
    try{
        for(let i=0; i<id.length; i++){
            let id1 = id[i].split('|')
            id1[0] = id1[1].split(': ')[0]
            id1[1] = id1[1].split(': ')[1]
            await NakladnayaNaPustuyTaruShoro.deleteMany({data: id1[2],
                organizator: id1[0],
                region: id1[1]})

        }
    } catch(error) {
        console.error(error)
    }
}

module.exports.deleteNakladnayaNaPustuyTaruShoro = deleteNakladnayaNaPustuyTaruShoro;
module.exports.getNakladnayaNaPustuyTaruShoro = getNakladnayaNaPustuyTaruShoro;
module.exports.setNakladnayaNaPustuyTaruShoro = setNakladnayaNaPustuyTaruShoro;
module.exports.addNakladnayaNaPustuyTaruShoro = addNakladnayaNaPustuyTaruShoro;
module.exports.getNakladnayaNaPustuyTaruShoroOrganizator = getNakladnayaNaPustuyTaruShoroOrganizator;
module.exports.getNakladnayaNaPustuyTaruShoroByData = getNakladnayaNaPustuyTaruShoroByData;