const OtchetRealizatoraShoro = require('../models/otchetRealizatoraShoro');
const OtchetOrganizatoraShoro = require('../models/otchetOrganizatoraShoro');
const RealizatorShoro = require('../models/realizatorShoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const mongoose = require('mongoose');

const getOtchetRealizatoraShoroOrganizator = async (search, sort, skip, id) => {
    try{
        let findResult = [], data = [], count;
        const row = [
            'реализатор',
            'дата',
        ];
        let organizator = await OrganizatorShoro.findOne({user: id})
        let region = organizator.region
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='дата'&&sort[1]=='descending')
            sort = '-data';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'data';
        if(search == ''){
            count = await OtchetRealizatoraShoro.count({region: region});
            findResult = await OtchetRealizatoraShoro
                .find({region: region})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await OtchetRealizatoraShoro.count({
                region: region,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetRealizatoraShoro.find({
                organizator: organizator, region: region,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        } else {
            count = await OtchetRealizatoraShoro.count({
                organizator: organizator, region: region,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetRealizatoraShoro.find({
                organizator: organizator, region: region,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].realizator + ': ' + findResult[i].region + ' - ' + findResult[i].point, findResult[i].data]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const getOtchetRealizatoraShoroRealizator = async (search, sort, skip, id) => {
    try{
        let findResult = [], data = [], count;
        const row = [
            'реализатор',
            'дата',
        ];
        let realizator = await RealizatorShoro.findOne({user: id})
        let region = realizator.region
        let point = realizator.point
        realizator = realizator.name
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='дата'&&sort[1]=='descending')
            sort = '-data';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'data';
        if(search == ''){
            count = await OtchetRealizatoraShoro.count({realizator: realizator, region: region, point: point});
            findResult = await OtchetRealizatoraShoro
                .find({realizator: realizator, region: region, point: point})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await OtchetRealizatoraShoro.count({
                realizator: realizator, region: region, point: point,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetRealizatoraShoro.find({
                realizator: realizator, region: region, point: point,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        } else {
            count = await OtchetRealizatoraShoro.count({
                realizator: realizator, region: region, point: point,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetRealizatoraShoro.find({
                realizator: realizator, region: region, point: point,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].realizator + ': ' + findResult[i].region + ' - ' + findResult[i].point, findResult[i].data]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const getOtchetRealizatoraShoro = async (search, sort, skip) => {
    try{
        let findResult = [], data = [], count;
        const row = [
            'организатор',
            'дата',
        ];
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='реализатор'&&sort[1]=='descending')
            sort = '-реализатор';
        else if(sort[0]=='реализатор'&&sort[1]=='ascending')
            sort = 'реализатор';
        else if(sort[0]=='дата'&&sort[1]=='descending')
            sort = '-data';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'data';
        if(search == ''){
            count = await OtchetRealizatoraShoro.count();
            findResult = await OtchetRealizatoraShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await OtchetRealizatoraShoro.count({
                $or: [
                    {_id: search},
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetRealizatoraShoro.find({
                $or: [
                    {_id: search},
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        } else {
            count = await OtchetRealizatoraShoro.count({
                $or: [
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetRealizatoraShoro.find({
                $or: [
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(10);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].realizator + ': ' + findResult[i].region + ' - ' + findResult[i].point, findResult[i].data]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const addOtchetRealizatoraShoro = async (object) => {
    try{
        if(await OtchetRealizatoraShoro.findOne({data: object.data, realizator: object.realizator, region: object.region, point: object.point})===null){
            let _object = new OtchetRealizatoraShoro(object);

            let find = await OtchetOrganizatoraShoro.findOne({data: object.data, region: object.region, organizator: object.organizator})
            if(find!==null){
                let findDataTable = JSON.parse(find.dataTable)
                let addDataTable = JSON.parse(object.dataTable)

                findDataTable.r.otr += 100

                findDataTable.p.m.v += addDataTable.vydano.i.ml
                findDataTable.p.ch.v += addDataTable.vydano.i.chl
                findDataTable.p.k.v += addDataTable.vydano.i.kl
                findDataTable.p.sl.v += addDataTable.vydano.i.sl

                findDataTable.p.m.o += addDataTable.vozvrat.v.ml
                findDataTable.p.ch.o += addDataTable.vozvrat.v.chl
                findDataTable.p.k.o += addDataTable.vozvrat.v.kl
                findDataTable.p.sl.o += addDataTable.vozvrat.v.sl

                findDataTable.p.m.s += addDataTable.vozvrat.s.ml
                findDataTable.p.ch.s += addDataTable.vozvrat.s.chl
                findDataTable.p.k.s += addDataTable.vozvrat.s.kl
                findDataTable.p.sl.s += addDataTable.vozvrat.s.sl

                findDataTable.p.m.pl += addDataTable.vozvrat.p.ml
                findDataTable.p.ch.pl += addDataTable.vozvrat.p.chl
                findDataTable.p.k.pl += addDataTable.vozvrat.p.kl
                findDataTable.p.sl.pl += addDataTable.vozvrat.p.sl

                findDataTable.p.m.ps += addDataTable.vozvrat.virychka.ml
                findDataTable.p.ch.ps += addDataTable.vozvrat.virychka.chl
                findDataTable.p.k.ps += addDataTable.vozvrat.virychka.kl
                findDataTable.p.sl.ps += addDataTable.vozvrat.virychka.sl

                findDataTable.r.ntp += addDataTable.vozvrat.virychka.sl

                findDataTable['p']['i'] = findDataTable['p']['m']['ps'] + findDataTable['p']['ch']['ps'] + findDataTable['p']['k']['ps'] + findDataTable['p']['sl']['ps']
                findDataTable['i'] = findDataTable['p']['i'] - findDataTable['r']['otr'] - findDataTable['r']['oo'] - findDataTable['r']['ntp'] - findDataTable['r']['att'] - findDataTable['r']['at'] - findDataTable['r']['vs']


                findDataTable = JSON.stringify(findDataTable)
                await OtchetOrganizatoraShoro.findOneAndUpdate({_id: find._id}, {$set: {dataTable: findDataTable}});

            }

            await OtchetRealizatoraShoro.create(_object);
        }
    } catch(error) {
        console.error(error)
    }
}

const getOtchetRealizatoraShoroByDate = async (data, organizator, region) => {
    try{
        return(await OtchetRealizatoraShoro.find({data: data, organizator: organizator, region: region}))
    } catch(error) {
        console.error(error)
    }
}

const getOtchetRealizatoraShoroByData = async (data, realizator, region, point) => {
    try{
        return(await OtchetRealizatoraShoro.findOne({data: data, realizator: realizator, region: region, point: point}))
    } catch(error) {
        console.error(error)
    }
}

const setOtchetRealizatoraShoro = async (object, id) => {
    try{
        await OtchetRealizatoraShoro.findOneAndUpdate({_id: id}, {$set: object});
    } catch(error) {
        console.error(error)
    }
}

module.exports.getOtchetRealizatoraShoro = getOtchetRealizatoraShoro;
module.exports.setOtchetRealizatoraShoro = setOtchetRealizatoraShoro;
module.exports.addOtchetRealizatoraShoro = addOtchetRealizatoraShoro;
module.exports.getOtchetRealizatoraShoroRealizator = getOtchetRealizatoraShoroRealizator;
module.exports.getOtchetRealizatoraShoroOrganizator = getOtchetRealizatoraShoroOrganizator;
module.exports.getOtchetRealizatoraShoroByData = getOtchetRealizatoraShoroByData;
module.exports.getOtchetRealizatoraShoroByDate = getOtchetRealizatoraShoroByDate;