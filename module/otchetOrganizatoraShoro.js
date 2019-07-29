const OtchetOrganizatoraShoro = require('../models/otchetOrganizatoraShoro');
const skip1 = require('../module/const').skip;
const getToday = require('../module/const').getToday;
const OrganizatorShoro = require('../models/organizatorShoro');
const mongoose = require('mongoose');

const getOtchetOrganizatoraShoroOrganizator = async (search, sort, skip, id) => {
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
            count = await OtchetOrganizatoraShoro.count({guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'}});
            findResult = await OtchetOrganizatoraShoro
                .find({guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'}})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await OtchetOrganizatoraShoro.count({
                guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'},
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetOrganizatoraShoro.find({
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
            count = await OtchetOrganizatoraShoro.count({
                guidOrganizator: guidOrganizator, guidRegion: {'$regex': guidRegion, '$options': 'i'},
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetOrganizatoraShoro.find({
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

const getOtchetOrganizatoraShoro = async (search, sort, skip, region) => {
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
            count = await OtchetOrganizatoraShoro.count({guidRegion: {'$regex': region, '$options': 'i'}});
            findResult = await OtchetOrganizatoraShoro
                .find({guidRegion: {'$regex': region, '$options': 'i'}})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await OtchetOrganizatoraShoro.count({
                guidRegion: {'$regex': region, '$options': 'i'},
                $or: [
                    {_id: search},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetOrganizatoraShoro.find({
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
            count = await OtchetOrganizatoraShoro.count({
                guidRegion: {'$regex': region, '$options': 'i'},
                $or: [
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetOrganizatoraShoro.find({
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

const getOtchetOrganizatoraShoroToday = async (search, sort, skip) => {
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
            count = await OtchetOrganizatoraShoro.count({data: date});
            findResult = await OtchetOrganizatoraShoro
                .find({data: date})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await OtchetOrganizatoraShoro.count({
                data: date,
                $or: [
                    {_id: search},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetOrganizatoraShoro.find({
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
            count = await OtchetOrganizatoraShoro.count({
                data: date,
                $or: [
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetOrganizatoraShoro.find({
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

const addOtchetOrganizatoraShoro = async (object) => {
        if(await OtchetOrganizatoraShoro.findOne({data: object.data, guidOrganizator: object.guidOrganizator, guidRegion: object.guidRegion})===null){
            let _object = new OtchetOrganizatoraShoro(object);
            await OtchetOrganizatoraShoro.create(_object);
        }

}

const getOtchetOrganizatoraShoroByData = async (data, organizator, region) => {
        return(await OtchetOrganizatoraShoro.findOne({data: data, guidOrganizator: organizator, guidRegion: {'$regex': region, '$options': 'i'}}))

}

const createOtchetOrganizatoraShoro = async (data, organizator, region, guidOrganizator, guidRegion) => {
        let _object = new OtchetOrganizatoraShoro({
            dataTable: JSON.stringify({
                'p': {
                    'i': 0,
                    'm': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                    'ch': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                    'k': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                    'sl': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                    's02': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                    's04': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                    'b': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                },
                'r': {
                    'otr': 0,
                    'oo': 100,
                    'ntp': 0,
                    'att': 0,
                    'at': '',
                    'vs': '',
                    'inc': 0
                },
                'a': {
                    'n': '',
                    'r': '',
                    'd1': '',
                    'd2': '',
                    'd3': '',
                    's': '',
                    'lkm': '',
                },
                'i': -100,
                'm': false,
            }),
            data: data,
            organizator: organizator,
            region: region,
            guidRegion: guidRegion,
            guidOrganizator: guidOrganizator,
            disabled: false,
        });
        await OtchetOrganizatoraShoro.create(_object)

}

const setOtchetOrganizatoraShoro = async (object, id) => {
        await OtchetOrganizatoraShoro.findOneAndUpdate({_id: id}, {$set: object});

}

const deleteOtchetOrganizatoraShoro = async (id) => {
        for(let i=0; i<id.length; i++){
            let id1 = id[i].split('|')
            id1[0] = id1[1].split(': ')[0]
            id1[1] = id1[1].split(': ')[1]
            await OtchetOrganizatoraShoro.deleteMany({
                data: id1[2],
                guidOrganizator: id1[0],
                guidRegion: id1[1]})

        }

}

module.exports.getOtchetOrganizatoraShoroToday = getOtchetOrganizatoraShoroToday
module.exports.createOtchetOrganizatoraShoro = createOtchetOrganizatoraShoro;
module.exports.deleteOtchetOrganizatoraShoro = deleteOtchetOrganizatoraShoro;
module.exports.getOtchetOrganizatoraShoro = getOtchetOrganizatoraShoro;
module.exports.setOtchetOrganizatoraShoro = setOtchetOrganizatoraShoro;
module.exports.addOtchetOrganizatoraShoro = addOtchetOrganizatoraShoro;
module.exports.getOtchetOrganizatoraShoroOrganizator = getOtchetOrganizatoraShoroOrganizator;
module.exports.getOtchetOrganizatoraShoroByData = getOtchetOrganizatoraShoroByData;