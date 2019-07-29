const NakladnayaNaPustuyTaruShoro = require('../models/nakladnayaNaPustuyTaruShoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const skip1 = require('../module/const').skip;
const mongoose = require('mongoose');
const getToday = require('../module/const').getToday;

const getNakladnayaNaPustuyTaruShoroOrganizator = async (search, sort, skip, id) => {
        let findResult = [], data = [], count;
        const row = [
            'организатор',
            'дата',
        ];
        let organizator = await OrganizatorShoro.findOne({user: id})
        let guidRegion = organizator.guidRegion
        let guidOrganizator = organizator.guid
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='дата'&&sort[1]=='descending')
            sort = '-data';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'data';
        if(search == ''){
            count = await NakladnayaNaPustuyTaruShoro.count({guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'}});
            findResult = await NakladnayaNaPustuyTaruShoro
                .find({guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'}})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaNaPustuyTaruShoro.count({
                guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'},
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaPustuyTaruShoro.find({
                guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'},
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
                guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'},
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaPustuyTaruShoro.find({
                guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'},
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].organizator + ': ' + findResult[i].region, findResult[i].data, findResult[i].guidOrganizator, findResult[i].guidRegion]);
        }
        return {data: data, count: count, row: row}

}

const getNakladnayaNaPustuyTaruShoro = async (search, sort, skip, region) => {
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
            count = await NakladnayaNaPustuyTaruShoro.count({
                guidRegion: {'$regex': region, '$options': 'i'},
            });
            findResult = await NakladnayaNaPustuyTaruShoro
                .find({
                    guidRegion: {'$regex': region, '$options': 'i'},})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaNaPustuyTaruShoro.count({
                guidRegion: {'$regex': region, '$options': 'i'},
                $or: [
                    {_id: search},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaPustuyTaruShoro.find({
                guidRegion: {'$regex': region, '$options': 'i'},
                $or: [
                    {_id: search},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        } else {
            count = await NakladnayaNaPustuyTaruShoro.count({
                guidRegion: {'$regex': region, '$options': 'i'},
                $or: [
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaPustuyTaruShoro.find({
                guidRegion: {'$regex': region, '$options': 'i'},
                $or: [
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].organizator + ': ' + findResult[i].region, findResult[i].data, findResult[i].guidOrganizator, findResult[i].guidRegion]);
        }
        return {data: data, count: count, row: row}

}

const getNakladnayaNaPustuyTaruShoroToday = async (search, sort, skip) => {
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
        let date = await getToday()
        if(search == ''){
            count = await NakladnayaNaPustuyTaruShoro.count({
                data: date,
            });
            findResult = await NakladnayaNaPustuyTaruShoro
                .find({
                    data: date,})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaNaPustuyTaruShoro.count({
                data: date,
                $or: [
                    {_id: search},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaPustuyTaruShoro.find({
                data: date,
                $or: [
                    {_id: search},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        } else {
            count = await NakladnayaNaPustuyTaruShoro.count({
                data: date,
                $or: [
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaNaPustuyTaruShoro.find({
                data: date,
                $or: [
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].organizator + ': ' + findResult[i].region, findResult[i].data, findResult[i].guidOrganizator, findResult[i].guidRegion]);
        }
        return {data: data, count: count, row: row}

}

const addNakladnayaNaPustuyTaruShoro = async (object) => {
        if(await NakladnayaNaPustuyTaruShoro.findOne({data: object.data, guidOrganizator: object.guidOrganizator, guidRegion: object.guidRegion})===null){
            let _object = new NakladnayaNaPustuyTaruShoro(object);
            await NakladnayaNaPustuyTaruShoro.create(_object);
        }

}

const getNakladnayaNaPustuyTaruShoroByData = async (data, organizator, region) => {
        return(await NakladnayaNaPustuyTaruShoro.findOne({data: data, guidOrganizator: organizator, guidRegion: {'$regex': region, '$options': 'i'}}))

}

const setNakladnayaNaPustuyTaruShoro = async (object, id) => {
        await NakladnayaNaPustuyTaruShoro.findOneAndUpdate({_id: id}, {$set: object});

}

const deleteNakladnayaNaPustuyTaruShoro = async (id) => {
        for(let i=0; i<id.length; i++){
            let id1 = id[i].split('|')
            id1[0] = id1[1].split(': ')[0]
            id1[1] = id1[1].split(': ')[1]
            await NakladnayaNaPustuyTaruShoro.deleteMany({data: id1[2],
                guidOrganizator: id1[0],
                guidRegion: id1[1]})

        }

}

module.exports.deleteNakladnayaNaPustuyTaruShoro = deleteNakladnayaNaPustuyTaruShoro;
module.exports.getNakladnayaNaPustuyTaruShoroToday = getNakladnayaNaPustuyTaruShoroToday;
module.exports.getNakladnayaNaPustuyTaruShoro = getNakladnayaNaPustuyTaruShoro;
module.exports.setNakladnayaNaPustuyTaruShoro = setNakladnayaNaPustuyTaruShoro;
module.exports.addNakladnayaNaPustuyTaruShoro = addNakladnayaNaPustuyTaruShoro;
module.exports.getNakladnayaNaPustuyTaruShoroOrganizator = getNakladnayaNaPustuyTaruShoroOrganizator;
module.exports.getNakladnayaNaPustuyTaruShoroByData = getNakladnayaNaPustuyTaruShoroByData;