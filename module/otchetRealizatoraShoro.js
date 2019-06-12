const OtchetRealizatoraShoro = require('../models/otchetRealizatoraShoro');
const OtchetOrganizatoraShoro = require('../models/otchetOrganizatoraShoro');
const RealizatorShoro = require('../models/realizatorShoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const PlanShoro = require('../models/planShoro');
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
                .limit(10)
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
                .limit(10);
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
                .limit(10);
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
            await OtchetRealizatoraShoro.create(_object);

            let findOrganizator = await OtchetOrganizatoraShoro.findOne({data: object.data, region: object.region, organizator: object.organizator})
            let findRealizators = await OtchetRealizatoraShoro.find({data: object.data, region: object.region, organizator: object.organizator})
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
                                    findPlanRegions[i]['points'][i1]['current'] += JSON.parse(findOtchetRealizatoraShoro[i2].dataTable)['i']['iv']
                                }
                            }
                            findPlanRegions[i]['current'] += findPlanRegions[i]['points'][i1]['current']
                        }
                    }
                    findPlan.current += findPlanRegions[i]['current']
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

                findDataTable.p.m.o = 0
                findDataTable.p.ch.o = 0
                findDataTable.p.k.o = 0
                findDataTable.p.sl.o = 0

                findDataTable.p.m.s = 0
                findDataTable.p.ch.s = 0
                findDataTable.p.k.s = 0
                findDataTable.p.sl.s = 0

                findDataTable.p.m.pl = 0
                findDataTable.p.ch.pl = 0
                findDataTable.p.k.pl = 0
                findDataTable.p.sl.pl = 0

                findDataTable.p.m.ps = 0
                findDataTable.p.ch.ps = 0
                findDataTable.p.k.ps = 0
                findDataTable.p.sl.ps = 0

                findDataTable.p.m.ktt = findRealizators.length
                findDataTable.p.ch.ktt = findRealizators.length
                findDataTable.p.k.ktt = findRealizators.length
                findDataTable.p.sl.ktt = findRealizators.length
                findDataTable.r.otr = findRealizators.length*100
                findDataTable.r.ntp = 0
                findDataTable.r.att = 0
                findDataTable.r.inc = 0

                findDataTable['p']['i'] = 0
                findDataTable['i'] = 0

                let dolivkiM = [], dolivkiCh = [], dolivkiK = [], dolivkiSl = []

                for(let i = 0; i<findRealizators.length; i++){
                    let addDataTable = JSON.parse(findRealizators[i].dataTable)

                    if(addDataTable.vydano.d1.ml){
                        dolivkiM[i]=1
                    }
                    if(addDataTable.vydano.d2.ml!==0){
                        dolivkiM[i]=2
                    }
                    if(addDataTable.vydano.d3.ml!==0){
                        dolivkiM[i]=3
                    }

                    if(addDataTable.vydano.d1.kl){
                        dolivkiK[i]=1
                    }
                    if(addDataTable.vydano.d2.kl!==0){
                        dolivkiK[i]=2
                    }
                    if(addDataTable.vydano.d3.kl!==0){
                        dolivkiK[i]=3
                    }

                    if(addDataTable.vydano.d1.chl){
                        dolivkiCh[i]=1
                    }
                    if(addDataTable.vydano.d2.chl!==0){
                        dolivkiCh[i]=2
                    }
                    if(addDataTable.vydano.d3.chl!==0){
                        dolivkiCh[i]=3
                    }

                    if(addDataTable.vydano.d1.sl){
                        dolivkiSl[i]=1
                    }
                    if(addDataTable.vydano.d2.sl!==0){
                        dolivkiSl[i]=2
                    }
                    if(addDataTable.vydano.d3.sl!==0){
                        dolivkiSl[i]=3
                    }

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

                    findDataTable.r.ntp += addDataTable.i.n
                    findDataTable.r.att += addDataTable.i.m
                    findDataTable.r.inc += addDataTable.i.inc
                }

                findDataTable.p.m.kd = dolivkiM.length>0?Math.max.apply(Math, dolivkiM):0;
                findDataTable.p.k.kd = dolivkiK.length>0?Math.max.apply(Math, dolivkiK):0;
                findDataTable.p.ch.kd = dolivkiCh.length>0?Math.max.apply(Math, dolivkiCh):0;
                findDataTable.p.sl.kd = dolivkiSl.length>0?Math.max.apply(Math, dolivkiSl):0;

                findDataTable['p']['i'] = findDataTable['p']['m']['ps'] + findDataTable['p']['ch']['ps'] + findDataTable['p']['k']['ps'] + findDataTable['p']['sl']['ps']
                findDataTable['i'] = findDataTable['p']['i'] - findDataTable['r']['otr'] - findDataTable['r']['oo'] - findDataTable['r']['inc'] - findDataTable['r']['ntp'] - findDataTable['r']['att'] - findDataTable['r']['at'] - findDataTable['r']['vs']

                findDataTable = JSON.stringify(findDataTable)
                await OtchetOrganizatoraShoro.findOneAndUpdate({_id: findOrganizator._id}, {$set: {dataTable: findDataTable}});

            }
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
                                findPlanRegions[i]['points'][i1]['current'] += JSON.parse(findOtchetRealizatoraShoro[i2].dataTable)['i']['iv']
                            }
                        }
                        findPlanRegions[i]['current'] += findPlanRegions[i]['points'][i1]['current']
                    }
                }
                findPlan.current += findPlanRegions[i]['current']
            }
            await PlanShoro.findOneAndUpdate({_id: findPlan._id}, {
                $set: {
                    regions: JSON.stringify(findPlanRegions),
                    current: findPlan.current
                }
            });
        }
        let findOrganizator = await OtchetOrganizatoraShoro.findOne({data: object.data, region: object.region, organizator: object.organizator})
        let findRealizators = await OtchetRealizatoraShoro.find({data: object.data, region: object.region, organizator: object.organizator})
        if(findOrganizator!==null){
            let findDataTable = JSON.parse(findOrganizator.dataTable)

            findDataTable.p.m.v = 0
            findDataTable.p.ch.v = 0
            findDataTable.p.k.v = 0
            findDataTable.p.sl.v = 0

            findDataTable.p.m.o = 0
            findDataTable.p.ch.o = 0
            findDataTable.p.k.o = 0
            findDataTable.p.sl.o = 0

            findDataTable.p.m.s = 0
            findDataTable.p.ch.s = 0
            findDataTable.p.k.s = 0
            findDataTable.p.sl.s = 0

            findDataTable.p.m.pl = 0
            findDataTable.p.ch.pl = 0
            findDataTable.p.k.pl = 0
            findDataTable.p.sl.pl = 0

            findDataTable.p.m.ps = 0
            findDataTable.p.ch.ps = 0
            findDataTable.p.k.ps = 0
            findDataTable.p.sl.ps = 0

            findDataTable.p.m.ktt = findRealizators.length
            findDataTable.p.ch.ktt = findRealizators.length
            findDataTable.p.k.ktt = findRealizators.length
            findDataTable.p.sl.ktt = findRealizators.length
            findDataTable.r.otr = findRealizators.length*100
            console.log(findRealizators.length)

            findDataTable.r.ntp = 0
            findDataTable.r.att = 0
            findDataTable.r.inc = 0

            findDataTable['p']['i'] = 0
            findDataTable['i'] = 0

            let dolivkiM = [], dolivkiCh = [], dolivkiK = [], dolivkiSl = []

            for(let i = 0; i<findRealizators.length; i++){
                let addDataTable = JSON.parse(findRealizators[i].dataTable)

                if(addDataTable.vydano.d1.ml!==0){
                    dolivkiM[i]=1
                }
                if(addDataTable.vydano.d2.ml!==0){
                    dolivkiM[i]=2
                }
                if(addDataTable.vydano.d3.ml!==0){
                    dolivkiM[i]=3
                }

                if(addDataTable.vydano.d1.kl!==0){
                    dolivkiK[i]=1
                }
                if(addDataTable.vydano.d2.kl!==0){
                    dolivkiK[i]=2
                }
                if(addDataTable.vydano.d3.kl!==0){
                    dolivkiK[i]=3
                }

                if(addDataTable.vydano.d1.chl!==0){
                    dolivkiCh[i]=1
                }
                if(addDataTable.vydano.d2.chl!==0){
                    dolivkiCh[i]=2
                }
                if(addDataTable.vydano.d3.chl!==0){
                    dolivkiCh[i]=3
                }

                if(addDataTable.vydano.d1.sl!==0){
                    dolivkiSl[i]=1
                }
                if(addDataTable.vydano.d2.sl!==0){
                    dolivkiSl[i]=2
                }
                if(addDataTable.vydano.d3.sl!==0){
                    dolivkiSl[i]=3
                }

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

                findDataTable.r.ntp += addDataTable.i.n
                findDataTable.r.att += addDataTable.i.m
                findDataTable.r.inc += addDataTable.i.inc

            }


            findDataTable.p.m.kd = dolivkiM.length>0?Math.max.apply(Math, dolivkiM):0;
            findDataTable.p.k.kd = dolivkiK.length>0?Math.max.apply(Math, dolivkiK):0;
            findDataTable.p.ch.kd = dolivkiCh.length>0?Math.max.apply(Math, dolivkiCh):0;
            findDataTable.p.sl.kd = dolivkiSl.length>0?Math.max.apply(Math, dolivkiSl):0;

            findDataTable['p']['i'] = findDataTable['p']['m']['ps'] + findDataTable['p']['ch']['ps'] + findDataTable['p']['k']['ps'] + findDataTable['p']['sl']['ps']
            findDataTable['i'] = findDataTable['p']['i'] - findDataTable['r']['otr'] - findDataTable['r']['oo'] - findDataTable['r']['inc'] - findDataTable['r']['att'] - findDataTable['r']['ntp'] - findDataTable['r']['at'] - findDataTable['r']['vs']

            findDataTable = JSON.stringify(findDataTable)
            await OtchetOrganizatoraShoro.findOneAndUpdate({_id: findOrganizator._id}, {$set: {dataTable: findDataTable}});

        }

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

            let findOrganizator = await OtchetOrganizatoraShoro.findOne({data: object.data, region: object.region, organizator: object.organizator})
            let findRealizators = await OtchetRealizatoraShoro.find({data: object.data, region: object.region, organizator: object.organizator})
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
                                        findPlanRegions[i]['points'][i1]['current'] += JSON.parse(findOtchetRealizatoraShoro[i2].dataTable)['i']['iv']
                                    }
                            }
                            findPlanRegions[i]['current'] += findPlanRegions[i]['points'][i1]['current']
                        }
                    }
                    findPlan.current += findPlanRegions[i]['current']
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

                findDataTable.p.m.o = 0
                findDataTable.p.ch.o = 0
                findDataTable.p.k.o = 0
                findDataTable.p.sl.o = 0

                findDataTable.p.m.s = 0
                findDataTable.p.ch.s = 0
                findDataTable.p.k.s = 0
                findDataTable.p.sl.s = 0

                findDataTable.p.m.pl = 0
                findDataTable.p.ch.pl = 0
                findDataTable.p.k.pl = 0
                findDataTable.p.sl.pl = 0

                findDataTable.p.m.ps = 0
                findDataTable.p.ch.ps = 0
                findDataTable.p.k.ps = 0
                findDataTable.p.sl.ps = 0

                findDataTable.p.m.ktt = findRealizators.length
                findDataTable.p.ch.ktt = findRealizators.length
                findDataTable.p.k.ktt = findRealizators.length
                findDataTable.p.sl.ktt = findRealizators.length
                findDataTable.r.otr = findRealizators.length*100

                findDataTable.r.ntp = 0
                findDataTable.r.att = 0
                findDataTable.r.inc = 0

                findDataTable['p']['i'] = 0
                findDataTable['i'] = 0

                let dolivkiM = [], dolivkiCh = [], dolivkiK = [], dolivkiSl = []

                for(let i = 0; i<findRealizators.length; i++){
                    let addDataTable = JSON.parse(findRealizators[i].dataTable)

                    if(addDataTable.vydano.d1.ml){
                        dolivkiM[i]=1
                    }
                    if(addDataTable.vydano.d2.ml!==0){
                        dolivkiM[i]=2
                    }
                    if(addDataTable.vydano.d3.ml!==0){
                        dolivkiM[i]=3
                    }

                    if(addDataTable.vydano.d1.kl){
                        dolivkiK[i]=1
                    }
                    if(addDataTable.vydano.d2.kl!==0){
                        dolivkiK[i]=2
                    }
                    if(addDataTable.vydano.d3.kl!==0){
                        dolivkiK[i]=3
                    }

                    if(addDataTable.vydano.d1.chl){
                        dolivkiCh[i]=1
                    }
                    if(addDataTable.vydano.d2.chl!==0){
                        dolivkiCh[i]=2
                    }
                    if(addDataTable.vydano.d3.chl!==0){
                        dolivkiCh[i]=3
                    }

                    if(addDataTable.vydano.d1.sl){
                        dolivkiSl[i]=1
                    }
                    if(addDataTable.vydano.d2.sl!==0){
                        dolivkiSl[i]=2
                    }
                    if(addDataTable.vydano.d3.sl!==0){
                        dolivkiSl[i]=3
                    }

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

                    findDataTable.r.ntp += addDataTable.i.n
                    findDataTable.r.att += addDataTable.i.m
                    findDataTable.r.inc += addDataTable.i.inc

                }

                findDataTable.p.m.kd = dolivkiM.length>0?Math.max.apply(Math, dolivkiM):0;
                findDataTable.p.k.kd = dolivkiK.length>0?Math.max.apply(Math, dolivkiK):0;
                findDataTable.p.ch.kd = dolivkiCh.length>0?Math.max.apply(Math, dolivkiCh):0;
                findDataTable.p.sl.kd = dolivkiSl.length>0?Math.max.apply(Math, dolivkiSl):0;

                findDataTable['p']['i'] = findDataTable['p']['m']['ps'] + findDataTable['p']['ch']['ps'] + findDataTable['p']['k']['ps'] + findDataTable['p']['sl']['ps']
                findDataTable['i'] = findDataTable['p']['i'] - findDataTable['r']['otr'] - findDataTable['r']['oo'] - findDataTable['r']['inc'] - findDataTable['r']['att'] - findDataTable['r']['ntp'] - findDataTable['r']['at'] - findDataTable['r']['vs']

                findDataTable = JSON.stringify(findDataTable)
                await OtchetOrganizatoraShoro.findOneAndUpdate({_id: findOrganizator._id}, {$set: {dataTable: findDataTable}});

            }

        }
    } catch(error) {
        console.error(error)
    }
}

module.exports.deleteOtchetRealizatoraShoro = deleteOtchetRealizatoraShoro;
module.exports.getOtchetRealizatoraShoro = getOtchetRealizatoraShoro;
module.exports.setOtchetRealizatoraShoro = setOtchetRealizatoraShoro;
module.exports.addOtchetRealizatoraShoro = addOtchetRealizatoraShoro;
module.exports.getOtchetRealizatoraShoroRealizator = getOtchetRealizatoraShoroRealizator;
module.exports.getOtchetRealizatoraShoroOrganizator = getOtchetRealizatoraShoroOrganizator;
module.exports.getOtchetRealizatoraShoroByData = getOtchetRealizatoraShoroByData;
module.exports.getOtchetRealizatoraShoroByDate = getOtchetRealizatoraShoroByDate;