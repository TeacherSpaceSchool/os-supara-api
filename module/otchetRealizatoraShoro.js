const OtchetRealizatoraShoro = require('../models/otchetRealizatoraShoro');
const OtchetOrganizatoraShoro = require('../models/otchetOrganizatoraShoro');
const RealizatorShoro = require('../models/realizatorShoro');
const NakladnayaNaVecherniyVozvratShoro = require('../models/nakladnayaNaVecherniyVozvratShoro');
const NakladnayaSklad1Shoro = require('../models/nakladnayaSklad1Shoro');
const getTomorrow = require('./const').getTomorrow;
const OrganizatorShoro = require('../models/organizatorShoro');
const PlanShoro = require('../models/planShoro');
const mongoose = require('mongoose');
const skip1 = require('../module/const').skip;
const checkInt = require('../module/const').checkInt;

const getOtchetRealizatoraShoroOrganizator = async (search, sort, skip, id) => {
    try{
        let findResult = [], data = [], count;
        const row = [
            'реализатор',
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
            count = await OtchetRealizatoraShoro.count({organizator: organizator,region: region});
            findResult = await OtchetRealizatoraShoro
                .find({organizator: organizator,region: region})
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await OtchetRealizatoraShoro.count({
                organizator: organizator,
                region: region,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetRealizatoraShoro.find({
                organizator: organizator, region: region,
                $or: [
                    {_id: search},
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        } else {
            count = await OtchetRealizatoraShoro.count({
                organizator: organizator, region: region,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetRealizatoraShoro.find({
                organizator: organizator, region: region,
                $or: [
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
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
                .limit(skip1)
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
                .limit(skip1);
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
                .limit(skip1);
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
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await OtchetRealizatoraShoro.count({
                $or: [
                    {_id: search},
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetRealizatoraShoro.find({
                $or: [
                    {_id: search},
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        } else {
            count = await OtchetRealizatoraShoro.count({
                $or: [
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await OtchetRealizatoraShoro.find({
                $or: [
                    {region: {'$regex': search, '$options': 'i'}},
                    {organizator: {'$regex': search, '$options': 'i'}},
                    {realizator: {'$regex': search, '$options': 'i'}},
                    {data: {'$regex': search, '$options': 'i'}},
                    {point: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        for (let i=0; i<findResult.length; i++){
            console.log(findResult[i])

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
            await OtchetRealizatoraShoro.create(_object)
            calculateAll(object)





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
        calculateAll(object)
    } catch(error) {
        console.error(error)
    }
}

const deleteOtchetRealizatoraShoro = async (id) => {
    try{
        for(let i=0; i<id.length; i++){
            let id1 = id[i].split('|')
            id1[0] = id1[2].split(': ')[0]
            id1[1] = id1[2].split(': ')[1].split(' - ')[0]
            id1[2] = id1[2].split(': ')[1].split(' - ')[1]

            let object = await OtchetRealizatoraShoro.findOne({
                realizator: id1[0],
                region: id1[1],
                point: id1[2],
                data: id1[3],
            })

            await OtchetRealizatoraShoro.deleteMany({
                realizator: id1[0],
                region: id1[1],
                point: id1[2],
                data: id1[3],
                })

            calculateAll(object)

        }
    } catch(error) {
        console.error(error)
    }
}

const calculateAll = async (object) => {
    try{
        let findOrganizator = await OtchetOrganizatoraShoro.findOne({data: object.data, region: object.region, organizator: object.organizator})
        let findRealizators = await OtchetRealizatoraShoro.find({data: object.data, region: object.region, organizator: object.organizator})
        let findNakladnayaNaVecherniyVozvratShoro = await NakladnayaNaVecherniyVozvratShoro.findOne({data: object.data, region: object.region, organizator: object.organizator})
        let findDataNakladnayaNaVecherniyVozvratShoro
        if(findNakladnayaNaVecherniyVozvratShoro!==null){
            findDataNakladnayaNaVecherniyVozvratShoro = JSON.parse(findNakladnayaNaVecherniyVozvratShoro.dataTable)
            findDataNakladnayaNaVecherniyVozvratShoro['m']['data'] = []
            findDataNakladnayaNaVecherniyVozvratShoro['ch']['data'] = []
            findDataNakladnayaNaVecherniyVozvratShoro['k']['data'] = []
            findDataNakladnayaNaVecherniyVozvratShoro['m']['all'] = 0
            findDataNakladnayaNaVecherniyVozvratShoro['ch']['all'] = 0
            findDataNakladnayaNaVecherniyVozvratShoro['k']['all'] = 0
            for(let i = 0; i<findRealizators.length; i++){
                let addDataTable = JSON.parse(findRealizators[i].dataTable)
                if(addDataTable.vozvrat.v.mn.length>0&&checkInt(addDataTable.vozvrat.v.ml)>0) {
                    findDataNakladnayaNaVecherniyVozvratShoro['m']['data'].push({
                        '№': addDataTable.vozvrat.v.mn,
                        'l': addDataTable.vozvrat.v.ml
                    })
                    findDataNakladnayaNaVecherniyVozvratShoro['m']['all'] += checkInt(addDataTable.vozvrat.v.ml)
                }
                if(addDataTable.vozvrat.v.kn.length>0&&checkInt(addDataTable.vozvrat.v.kl)>0) {
                    findDataNakladnayaNaVecherniyVozvratShoro['k']['data'].push({
                        '№': addDataTable.vozvrat.v.kn,
                        'l': addDataTable.vozvrat.v.kl
                    })
                    findDataNakladnayaNaVecherniyVozvratShoro['k']['all'] += checkInt(addDataTable.vozvrat.v.kl)
                }
            }
            findDataNakladnayaNaVecherniyVozvratShoro = JSON.stringify(findDataNakladnayaNaVecherniyVozvratShoro)
            await NakladnayaNaVecherniyVozvratShoro.findOneAndUpdate({_id: findNakladnayaNaVecherniyVozvratShoro._id}, {$set: {dataTable: findDataNakladnayaNaVecherniyVozvratShoro}});
        }

        let findNakladnayaSklad1Shoro = await NakladnayaSklad1Shoro.findOne({data: getTomorrow(object.data), region: object.region, organizator: object.organizator})
        let findDataNakladnayaSklad1Shoro
        if(findNakladnayaSklad1Shoro!==null){
            findDataNakladnayaSklad1Shoro = JSON.parse(findNakladnayaSklad1Shoro.dataTable)
            findDataNakladnayaSklad1Shoro['vydano']['n']['ch25'] = 0
            findDataNakladnayaSklad1Shoro['vydano']['n']['ch10'] = 0
            findDataNakladnayaSklad1Shoro['vydano']['n']['chl'] = 0
            for(let i = 0; i<findRealizators.length; i++){
                let addDataTable = JSON.parse(findRealizators[i].dataTable)
                if(checkInt(addDataTable.vozvrat.v.chl)>0){
                    findDataNakladnayaSklad1Shoro['vydano']['n']['chl'] += checkInt(addDataTable.vozvrat.v.chl)
                    if(addDataTable.vozvrat.v.chn25.length>0){
                        findDataNakladnayaSklad1Shoro['vydano']['n']['ch25'] += 1

                    }
                    if(addDataTable.vozvrat.v.chn10.length>0){
                        findDataNakladnayaSklad1Shoro['vydano']['n']['ch10'] += 1

                    }
                }
            }
            findDataNakladnayaSklad1Shoro['vydano']['i']['chl'] = checkInt(findDataNakladnayaSklad1Shoro['vydano']['n']['chl']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['r']['chl']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['d1']['chl']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['d2']['chl']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['d3']['chl'])
            findDataNakladnayaSklad1Shoro['vydano']['i']['ch10'] = checkInt(findDataNakladnayaSklad1Shoro['vydano']['n']['ch10']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['r']['ch10']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['d1']['ch10']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['d2']['ch10']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['d3']['ch10'])
            findDataNakladnayaSklad1Shoro['vydano']['i']['ch25'] = checkInt(findDataNakladnayaSklad1Shoro['vydano']['n']['ch25']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['r']['ch25']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['d1']['ch25']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['d2']['ch25']) + checkInt(findDataNakladnayaSklad1Shoro['vydano']['d3']['ch25'])
            findDataNakladnayaSklad1Shoro = JSON.stringify(findDataNakladnayaSklad1Shoro)
            await NakladnayaSklad1Shoro.findOneAndUpdate({_id: findNakladnayaSklad1Shoro._id}, {$set: {dataTable: findDataNakladnayaSklad1Shoro}});
        }

        findNakladnayaSklad1Shoro = await NakladnayaSklad1Shoro.findOne({data: object.data, region: object.region, organizator: object.organizator})
        findDataNakladnayaSklad1Shoro
        if(findNakladnayaSklad1Shoro!==null){
            findDataNakladnayaSklad1Shoro = JSON.parse(findNakladnayaSklad1Shoro.dataTable)
            findDataNakladnayaSklad1Shoro['vozvrat']['n']['ch25'] = 0
            findDataNakladnayaSklad1Shoro['vozvrat']['n']['ch10'] = 0
            findDataNakladnayaSklad1Shoro['vozvrat']['n']['chl'] = 0
            for(let i = 0; i<findRealizators.length; i++){
                let addDataTable = JSON.parse(findRealizators[i].dataTable)
                if(checkInt(addDataTable.vozvrat.v.chl)>0){
                    findDataNakladnayaSklad1Shoro['vozvrat']['n']['chl'] += checkInt(addDataTable.vozvrat.v.chl)
                    if(addDataTable.vozvrat.v.chn25.length>0){
                        findDataNakladnayaSklad1Shoro['vozvrat']['n']['ch25'] += 1

                    }
                    if(addDataTable.vozvrat.v.chn10.length>0){
                        findDataNakladnayaSklad1Shoro['vozvrat']['n']['ch10'] += 1

                    }
                }
            }
            findDataNakladnayaSklad1Shoro['vozvrat']['i']['chl'] = checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['n']['chl']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['r']['chl']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['d1']['chl']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['d2']['chl']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['d3']['chl'])
            findDataNakladnayaSklad1Shoro['vozvrat']['i']['ch10'] = checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['n']['ch10']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['r']['ch10']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['d1']['ch10']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['d2']['ch10']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['d3']['ch10'])
            findDataNakladnayaSklad1Shoro['vozvrat']['i']['ch25'] = checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['n']['ch25']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['r']['ch25']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['d1']['ch25']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['d2']['ch25']) + checkInt(findDataNakladnayaSklad1Shoro['vozvrat']['d3']['ch25'])
            findDataNakladnayaSklad1Shoro = JSON.stringify(findDataNakladnayaSklad1Shoro)
            await NakladnayaSklad1Shoro.findOneAndUpdate({_id: findNakladnayaSklad1Shoro._id}, {$set: {dataTable: findDataNakladnayaSklad1Shoro}});
        }

        let findPlan = await PlanShoro.findOne({date: (object.data).substring(3)})
        if(findPlan!==null) {
            let findPlanRegions = JSON.parse(findPlan.regions)
            findPlan.current = 0
            for (let i = 0; i < findPlanRegions.length; i++) {
                if (findPlanRegions[i]['name'] == object.region) {
                    findPlanRegions[i]['current'] = 0
                    for (let i1 = 0; i1 < findPlanRegions[i]['points'].length; i1++) {
                        if (findPlanRegions[i]['points'][i1]['name'] == object.point) {
                            let findOtchetRealizatoraShoro = await OtchetRealizatoraShoro.find({data: {'$regex': (object.data).substring(3), '$options': 'i'}, region: findPlanRegions[i]['name'], point: findPlanRegions[i]['points'][i1]['name']});
                            findPlanRegions[i]['points'][i1]['current'] = 0
                            for (let i2 = 0; i2 < findOtchetRealizatoraShoro.length; i2++) {
                                findPlanRegions[i]['points'][i1]['current'] += checkInt(JSON.parse(findOtchetRealizatoraShoro[i2].dataTable)['i']['iv'])
                            }
                        }
                        findPlanRegions[i]['current'] += checkInt(findPlanRegions[i]['points'][i1]['current'])
                    }
                }
                findPlan.current += checkInt(findPlanRegions[i]['current'])
            }
            await PlanShoro.findOneAndUpdate({_id: findPlan._id}, {
                $set: {
                    regions: JSON.stringify(findPlanRegions),
                    current: findPlan.current
                }
            });
        }

        if(findOrganizator!==null){
            let findDataTable = JSON.parse(findOrganizator.dataTable)

            findDataTable.p.m.v = 0
            findDataTable.p.ch.v = 0
            findDataTable.p.k.v = 0
            findDataTable.p.sl.v = 0
            findDataTable.p.s02.v = 0
            findDataTable.p.s04.v = 0
            findDataTable.p.b.v = 0

            findDataTable.p.m.o = 0
            findDataTable.p.ch.o = 0
            findDataTable.p.k.o = 0
            findDataTable.p.sl.o = 0
            findDataTable.p.s02.o = 0
            findDataTable.p.s04.o = 0
            findDataTable.p.b.o = 0

            findDataTable.p.m.s = 0
            findDataTable.p.ch.s = 0
            findDataTable.p.k.s = 0
            findDataTable.p.sl.s = 0
            findDataTable.p.s02.s = 0
            findDataTable.p.s04.s = 0
            findDataTable.p.b.s = 0

            findDataTable.p.m.pl = 0
            findDataTable.p.ch.pl = 0
            findDataTable.p.k.pl = 0
            findDataTable.p.sl.pl = 0
            findDataTable.p.s02.pl = 0
            findDataTable.p.s04.pl = 0
            findDataTable.p.b.pl = 0

            findDataTable.p.m.ps = 0
            findDataTable.p.ch.ps = 0
            findDataTable.p.k.ps = 0
            findDataTable.p.sl.ps = 0
            findDataTable.p.s02.ps = 0
            findDataTable.p.s04.ps = 0
            findDataTable.p.b.ps = 0

            findDataTable.p.m.ktt = findRealizators.length
            findDataTable.p.ch.ktt = findRealizators.length
            findDataTable.p.k.ktt = findRealizators.length
            findDataTable.p.sl.ktt = findRealizators.length
            findDataTable.p.s02.ktt = findRealizators.length
            findDataTable.p.s04.ktt = findRealizators.length
            findDataTable.p.b.ktt = findRealizators.length
            findDataTable.r.otr = findRealizators.length*100
            findDataTable.r.ntp = 0
            findDataTable.r.att = 0
            findDataTable.r.inc = 0

            findDataTable['p']['i'] = 0
            findDataTable['i'] = 0

            let dolivkiM = [], dolivkiCh = [], dolivkiK = [], dolivkiSl = [], dolivkiS02 = [], dolivkiS04 = [], dolivkiB = []

            for(let i = 0; i<findRealizators.length; i++){
                let addDataTable = JSON.parse(findRealizators[i].dataTable)

                if(addDataTable.vydano.d3.ml.length>0){
                    dolivkiM[i]=3
                }
                else if(addDataTable.vydano.d2.ml.length>0){
                    dolivkiM[i]=2
                }
                else if(addDataTable.vydano.d1.ml.length>0){
                    dolivkiM[i]=1
                }
                else {
                    dolivkiM[i]=0
                }

                if(addDataTable.vydano.d3.kl.length>0){
                    dolivkiK[i]=3
                }
                else if(addDataTable.vydano.d2.kl.length>0){
                    dolivkiK[i]=2
                }
                else if(addDataTable.vydano.d1.kl.length>0){
                    dolivkiK[i]=1
                }
                else {
                    dolivkiK[i]=0
                }

                if(addDataTable.vydano.d3.chl.length>0){
                    dolivkiCh[i]=3
                }
                else if(addDataTable.vydano.d2.chl.length>0){
                    dolivkiCh[i]=2
                }
                else if(addDataTable.vydano.d1.chl.length>0){
                    dolivkiCh[i]=1
                }
                else {
                    dolivkiCh[i]=0
                }

                if(addDataTable.vydano.d3.sl.length>0){
                    dolivkiSl[i]=3
                }
                else if(addDataTable.vydano.d2.sl.length>0){
                    dolivkiSl[i]=2
                }
                else if(addDataTable.vydano.d1.sl.length>0){
                    dolivkiSl[i]=1
                }
                else {
                    dolivkiSl[i]=0
                }


                if(addDataTable.vydano.d3.s02.length>0){
                    dolivkiS02[i]=3
                }
                else if(addDataTable.vydano.d2.s02.length>0){
                    dolivkiS02[i]=2
                }
                else if(addDataTable.vydano.d1.s02.length>0){
                    dolivkiS02[i]=1
                }
                else {
                    dolivkiS02[i]=0
                }

                if(addDataTable.vydano.d3.s04.length>0){
                    dolivkiS04[i]=3
                }
                else if(addDataTable.vydano.d2.s04.length>0){
                    dolivkiS04[i]=2
                }
                else if(addDataTable.vydano.d1.s04.length>0){
                    dolivkiS04[i]=1
                }
                else {
                    dolivkiS04[i]=0
                }

                if(addDataTable.vydano.d3.b!==0){
                    dolivkiB[i]=3
                }
                if(addDataTable.vydano.d1.b){
                    dolivkiB[i]=1
                }
                if(addDataTable.vydano.d2.b!==0){
                    dolivkiB[i]=2
                }

                findDataTable.p.m.v += checkInt(addDataTable.vydano.i.ml)
                findDataTable.p.ch.v += checkInt(addDataTable.vydano.i.chl)
                findDataTable.p.k.v += checkInt(addDataTable.vydano.i.kl)
                findDataTable.p.sl.v += checkInt(addDataTable.vydano.i.sl)
                findDataTable.p.s02.v += checkInt(addDataTable.vydano.i.s02)
                findDataTable.p.s04.v += checkInt(addDataTable.vydano.i.s04)
                findDataTable.p.b.v += checkInt(addDataTable.vydano.i.b)

                findDataTable.p.m.o += checkInt(addDataTable.vozvrat.v.ml)
                findDataTable.p.ch.o += checkInt(addDataTable.vozvrat.v.chl)
                findDataTable.p.k.o += checkInt(addDataTable.vozvrat.v.kl)
                findDataTable.p.sl.o += checkInt(addDataTable.vozvrat.v.sl)
                findDataTable.p.s02.o += checkInt(addDataTable.vozvrat.v.s02)
                findDataTable.p.s04.o += checkInt(addDataTable.vozvrat.v.s04)
                findDataTable.p.b.o += checkInt(addDataTable.vozvrat.v.b)

                findDataTable.p.m.s += checkInt(addDataTable.vozvrat.s.ml)
                findDataTable.p.ch.s += checkInt(addDataTable.vozvrat.s.chl)
                findDataTable.p.k.s += checkInt(addDataTable.vozvrat.s.kl)
                findDataTable.p.sl.s += checkInt(addDataTable.vozvrat.s.sl)
                findDataTable.p.s02.s += checkInt(addDataTable.vozvrat.s.s02)
                findDataTable.p.s04.s += checkInt(addDataTable.vozvrat.s.s04)
                findDataTable.p.b.s += checkInt(addDataTable.vozvrat.s.b)

                findDataTable.p.m.pl += checkInt(addDataTable.vozvrat.p.ml)
                findDataTable.p.ch.pl += checkInt(addDataTable.vozvrat.p.chl)
                findDataTable.p.k.pl += checkInt(addDataTable.vozvrat.p.kl)
                findDataTable.p.sl.pl += checkInt(addDataTable.vozvrat.p.sl)
                findDataTable.p.s02.pl += checkInt(addDataTable.vozvrat.p.s02)
                findDataTable.p.s04.pl += checkInt(addDataTable.vozvrat.p.s04)
                findDataTable.p.b.pl += checkInt(addDataTable.vozvrat.p.b)

                findDataTable.p.m.ps += checkInt(addDataTable.vozvrat.virychka.ml)
                findDataTable.p.ch.ps += checkInt(addDataTable.vozvrat.virychka.chl)
                findDataTable.p.k.ps += checkInt(addDataTable.vozvrat.virychka.kl)
                findDataTable.p.sl.ps += checkInt(addDataTable.vozvrat.virychka.sl)
                findDataTable.p.s02.ps += checkInt(addDataTable.vozvrat.virychka.s02)
                findDataTable.p.s04.ps += checkInt(addDataTable.vozvrat.virychka.s04)
                findDataTable.p.b.ps += checkInt(addDataTable.vozvrat.virychka.b)

                findDataTable.r.ntp += checkInt(addDataTable.i.n)
                findDataTable.r.att += checkInt(addDataTable.i.m)
                findDataTable.r.inc += checkInt(addDataTable.i.inc)

            }

            findDataTable.p.m.kd = dolivkiM.length>0?Math.max.apply(Math, dolivkiM):0;
            findDataTable.p.k.kd = dolivkiK.length>0?Math.max.apply(Math, dolivkiK):0;
            findDataTable.p.ch.kd = dolivkiCh.length>0?Math.max.apply(Math, dolivkiCh):0;
            findDataTable.p.sl.kd = dolivkiSl.length>0?Math.max.apply(Math, dolivkiSl):0;
            findDataTable.p.s02.kd = dolivkiM.length>0?Math.max.apply(Math, dolivkiS02):0;
            findDataTable.p.s04.kd = dolivkiK.length>0?Math.max.apply(Math, dolivkiS04):0;
            findDataTable.p.b.kd = dolivkiCh.length>0?Math.max.apply(Math, dolivkiB):0;

            findDataTable['p']['i'] = checkInt(findDataTable['p']['m']['ps']) + checkInt(findDataTable['p']['ch']['ps']) + checkInt(findDataTable['p']['k']['ps']) + checkInt(findDataTable['p']['sl']['ps'])
            findDataTable['i'] = checkInt(findDataTable['p']['i']) - checkInt(findDataTable['r']['otr']) - checkInt(findDataTable['r']['oo']) - checkInt(findDataTable['r']['inc']) - checkInt(findDataTable['r']['ntp']) - checkInt(findDataTable['r']['att']) - checkInt(findDataTable['r']['at']) - checkInt(findDataTable['r']['vs'])

            findDataTable = JSON.stringify(findDataTable)
            await OtchetOrganizatoraShoro.findOneAndUpdate({_id: findOrganizator._id}, {$set: {dataTable: findDataTable}});

        }

    } catch(error) {
        console.error(error)
    }
}

module.exports.calculateAll = calculateAll;
module.exports.deleteOtchetRealizatoraShoro = deleteOtchetRealizatoraShoro;
module.exports.getOtchetRealizatoraShoro = getOtchetRealizatoraShoro;
module.exports.setOtchetRealizatoraShoro = setOtchetRealizatoraShoro;
module.exports.addOtchetRealizatoraShoro = addOtchetRealizatoraShoro;
module.exports.getOtchetRealizatoraShoroRealizator = getOtchetRealizatoraShoroRealizator;
module.exports.getOtchetRealizatoraShoroOrganizator = getOtchetRealizatoraShoroOrganizator;
module.exports.getOtchetRealizatoraShoroByData = getOtchetRealizatoraShoroByData;
module.exports.getOtchetRealizatoraShoroByDate = getOtchetRealizatoraShoroByDate;