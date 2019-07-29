const NakladnayaSklad2Shoro = require('../models/nakladnayaSklad2Shoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const mongoose = require('mongoose');
const skip1 = require('../module/const').skip;
const getToday = require('../module/const').getToday;

const getNakladnayaSklad2ShoroOrganizator = async (search, sort, skip, id) => {
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
            count = await NakladnayaSklad2Shoro.count({guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'}});
            findResult = await NakladnayaSklad2Shoro
                .find({guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'}})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaSklad2Shoro.count({
                guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'},
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad2Shoro.find({
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
            count = await NakladnayaSklad2Shoro.count({
                guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'},
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad2Shoro.find({
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

const getNakladnayaSklad2Shoro = async (search, sort, skip, region) => {
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
            count = await NakladnayaSklad2Shoro.count({guidRegion: {'$regex': region, '$options': 'i'}});
            findResult = await NakladnayaSklad2Shoro
                .find({guidRegion: {'$regex': region, '$options': 'i'}})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaSklad2Shoro.count({
                guidRegion: {'$regex': region, '$options': 'i'},
                $or: [
                    {_id: search},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad2Shoro.find({
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
            count = await NakladnayaSklad2Shoro.count({
                guidRegion: {'$regex': region, '$options': 'i'},
                $or: [
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad2Shoro.find({
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

const getNakladnayaSklad2ShoroToday = async (search, sort, skip) => {
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
            count = await NakladnayaSklad2Shoro.count({data: date});
            findResult = await NakladnayaSklad2Shoro
                .find({data: date})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await NakladnayaSklad2Shoro.count({
                data: date,
                $or: [
                    {_id: search},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad2Shoro.find({
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
            count = await NakladnayaSklad2Shoro.count({
                data: date,
                $or: [
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await NakladnayaSklad2Shoro.find({
                data: date,
                $or: [
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {reg: {'$regex': search, '$options': 'i'}},
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

const addNakladnayaSklad2Shoro = async (object) => {
        if(await NakladnayaSklad2Shoro.findOne({data: object.data, guidOrganizator: object.guidOrganizator, guidRegion: object.guidRegion})===null){
            let _object = new NakladnayaSklad2Shoro(object);
            await NakladnayaSklad2Shoro.create(_object);
        }

}

const getNakladnayaSklad2ShoroByData = async (data, organizator, region) => {
        return(await NakladnayaSklad2Shoro.findOne({data: data, guidOrganizator: organizator, guidRegion: {'$regex': region, '$options': 'i'}}))

}

const setNakladnayaSklad2Shoro = async (object, id) => {
        await NakladnayaSklad2Shoro.findOneAndUpdate({_id: id}, {$set: object});

}

const deleteNakladnayaSklad2Shoro = async (id) => {
        for(let i=0; i<id.length; i++){
            let id1 = id[i].split('|')
            id1[0] = id1[1].split(': ')[0]
            id1[1] = id1[1].split(': ')[1]
            await NakladnayaSklad2Shoro.deleteMany({data: id1[2],
                guidOrganizator: id1[0],
                guidRegion: id1[1]})

        }

}

module.exports.getNakladnayaSklad2ShoroToday = getNakladnayaSklad2ShoroToday;
module.exports.deleteNakladnayaSklad2Shoro = deleteNakladnayaSklad2Shoro;
module.exports.getNakladnayaSklad2Shoro = getNakladnayaSklad2Shoro;
module.exports.setNakladnayaSklad2Shoro = setNakladnayaSklad2Shoro;
module.exports.addNakladnayaSklad2Shoro = addNakladnayaSklad2Shoro;
module.exports.getNakladnayaSklad2ShoroOrganizator = getNakladnayaSklad2ShoroOrganizator;
module.exports.getNakladnayaSklad2ShoroByData = getNakladnayaSklad2ShoroByData;