const NakladnayaNaVecherniyVozvratShoro = require('../models/nakladnayaNaVecherniyVozvratShoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const mongoose = require('mongoose');

const getNakladnayaNaVecherniyVozvratShoroOrganizator = async (search, sort, skip, id) => {
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
            count = await NakladnayaNaVecherniyVozvratShoro.count({organizator: organizator, region: region});
            findResult = await NakladnayaNaVecherniyVozvratShoro
                .find({organizator: organizator, region: region})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaNaVecherniyVozvratShoro.count({
                organizator: organizator, region: region,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaVecherniyVozvratShoro.find({
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
            count = await NakladnayaNaVecherniyVozvratShoro.count({
                organizator: organizator, region: region,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaVecherniyVozvratShoro.find({
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

const getNakladnayaNaVecherniyVozvratShoro = async (search, sort, skip) => {
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
            count = await NakladnayaNaVecherniyVozvratShoro.count();
            findResult = await NakladnayaNaVecherniyVozvratShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaNaVecherniyVozvratShoro.count({
                $or: [
                    {_id: search},
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaVecherniyVozvratShoro.find({
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
            count = await NakladnayaNaVecherniyVozvratShoro.count({
                $or: [
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaVecherniyVozvratShoro.find({
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

const addNakladnayaNaVecherniyVozvratShoro = async (object) => {
    try{
        if(await NakladnayaNaVecherniyVozvratShoro.findOne({data: object.data, organizator: object.organizator, region: object.region})===null){
            let _object = new NakladnayaNaVecherniyVozvratShoro(object);
            await NakladnayaNaVecherniyVozvratShoro.create(_object);
        }
    } catch(error) {
        console.error(error)
    }
}

const getNakladnayaNaVecherniyVozvratShoroByData = async (data, organizator, region) => {
    try{
        return(await NakladnayaNaVecherniyVozvratShoro.findOne({data: data, organizator: organizator, region: region}))
    } catch(error) {
        console.error(error)
    }
}

const setNakladnayaNaVecherniyVozvratShoro = async (object, id) => {
    try{
        await NakladnayaNaVecherniyVozvratShoro.findOneAndUpdate({_id: id}, {$set: object});
    } catch(error) {
        console.error(error)
    }
}

module.exports.getNakladnayaNaVecherniyVozvratShoro = getNakladnayaNaVecherniyVozvratShoro;
module.exports.setNakladnayaNaVecherniyVozvratShoro = setNakladnayaNaVecherniyVozvratShoro;
module.exports.addNakladnayaNaVecherniyVozvratShoro = addNakladnayaNaVecherniyVozvratShoro;
module.exports.getNakladnayaNaVecherniyVozvratShoroOrganizator = getNakladnayaNaVecherniyVozvratShoroOrganizator;
module.exports.getNakladnayaNaVecherniyVozvratShoroByData = getNakladnayaNaVecherniyVozvratShoroByData;