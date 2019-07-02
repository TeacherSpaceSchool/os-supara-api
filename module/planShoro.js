const PlanShoro = require('../models/planShoro');
const mongoose = require('mongoose');
const OrganizatorShoro = require('../models/organizatorShoro');
const OtchetRealizatoraShoro = require('../models/otchetRealizatoraShoro');
const skip1 = require('../module/const').skip;
const checkInt = require('../module/const').checkInt;

const getPlanShoroOrganizator = async (search, sort, skip, id) => {
        let findResult = [], data = [], count;
        const row = [
            'дата',
            'норма',
            'текущее'
        ];
        let organizator = await OrganizatorShoro.findOne({user: id})
        let region = organizator.region
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='норма'&&sort[1]=='descending')
            sort = '-name';
        else if(sort[0]=='норма'&&sort[1]=='ascending')
            sort = 'name';
        else if(sort[0]=='регион'&&sort[1]=='descending')
            sort = '-region';
        else if(sort[0]=='регион'&&sort[1]=='ascending')
            sort = 'region';
        else if(sort[0]=='дата'&&sort[1]=='descending')
            sort = '-date';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'date';
        else if(sort[0]=='текущее'&&sort[1]=='descending')
            sort = '-inn';
        else if(sort[0]=='текущее'&&sort[1]=='ascending')
            sort = 'inn';
        else if(sort[0]=='создан'&&sort[1]=='descending')
            sort = '-updatedAt';
        else if(sort[0]=='создан'&&sort[1]=='ascending')
            sort = 'updatedAt';
        if(search == ''){
            count = await PlanShoro.count();
            findResult = await PlanShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        }
        else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await PlanShoro.count({
                $or: [
                    {_id: search},
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                    {date: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PlanShoro.find({
                $or: [
                    {_id: search},
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                    {date: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        else {
            count = await PlanShoro.count({
                $or: [
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                    {date: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PlanShoro.find({
                $or: [
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                    {date: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        for (let i=0; i<findResult.length; i++){
            let findPlanRegions = JSON.parse(findResult[i].regions)
            for (let i1 = 0; i1 < findPlanRegions.length; i1++) {
                if (findPlanRegions[i1]['name'] == region) {
                    data.push([ findResult[i].date, findPlanRegions[i1]['plan'], findPlanRegions[i1]['plan']!==0&&findPlanRegions[i1]['plan']!==''?Math.round(findPlanRegions[i1]['current']*100/findPlanRegions[i1]['plan'])+'%':findPlanRegions[i1]['current']]);
                    break
                }
            }
        }
        return {data: data, count: count, row: row}

}

const getPlanShoro = async (search, sort, skip) => {
        let findResult = [], data = [], count;
        const row = [
            'дата',
            'норма',
            'текущее'
        ];
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='норма'&&sort[1]=='descending')
            sort = '-name';
        else if(sort[0]=='норма'&&sort[1]=='ascending')
            sort = 'name';
        else if(sort[0]=='регион'&&sort[1]=='descending')
            sort = '-region';
        else if(sort[0]=='регион'&&sort[1]=='ascending')
            sort = 'region';
        else if(sort[0]=='дата'&&sort[1]=='descending')
            sort = '-date';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'date';
        else if(sort[0]=='текущее'&&sort[1]=='descending')
            sort = '-inn';
        else if(sort[0]=='текущее'&&sort[1]=='ascending')
            sort = 'inn';
        else if(sort[0]=='создан'&&sort[1]=='descending')
            sort = '-updatedAt';
        else if(sort[0]=='создан'&&sort[1]=='ascending')
            sort = 'updatedAt';
        if(search == ''){
            count = await PlanShoro.count();
            findResult = await PlanShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        }
        else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await PlanShoro.count({
                $or: [
                    {_id: search},
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                    {date: {'$regex': search, '$options': 'i'}},
                   ]
            });
            findResult = await PlanShoro.find({
                $or: [
                    {_id: search},
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                    {date: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        else {
            count = await PlanShoro.count({
                $or: [
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                    {date: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await PlanShoro.find({
                $or: [
                    {point: {'$regex': search, '$options': 'i'}},
                    {region: {'$regex': search, '$options': 'i'}},
                    {date: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([ findResult[i].date, findResult[i].norma, findResult[i].norma!==0&&findResult[i].norma!==''?Math.round(findResult[i].current*100/findResult[i].norma)+'%':findResult[i].current]);
        }
        return {data: data, count: count, row: row}

}

const addPlanShoro = async (object) => {
        object.current = 0
        let findPlanRegions = JSON.parse(object.regions)
        for (let i = 0; i < findPlanRegions.length; i++) {
            findPlanRegions[i]['current'] = 0
            for (let i1 = 0; i1 < findPlanRegions[i]['points'].length; i1++) {
                let findOtchetRealizatoraShoro = await OtchetRealizatoraShoro.find({data: {'$regex': object.date, '$options': 'i'}, region: findPlanRegions[i]['name'], point: findPlanRegions[i]['points'][i1]['name']});
                findPlanRegions[i]['points'][i1]['current'] = 0
                for (let i2 = 0; i2 < findOtchetRealizatoraShoro.length; i2++) {
                    findPlanRegions[i]['points'][i1]['current'] += checkInt(JSON.parse(findOtchetRealizatoraShoro[i2].dataTable)['i']['iv'])
                }
                findPlanRegions[i]['current'] += checkInt(findPlanRegions[i]['points'][i1]['current'])
            }
            object.current += checkInt(findPlanRegions[i]['current'])
        }
        object.regions = JSON.stringify(findPlanRegions)
        let _object = new PlanShoro(object);
        await PlanShoro.create(_object);

}

const setPlanShoro = async (object, id) => {
        await PlanShoro.findOneAndUpdate({_id: id}, {$set: object});

}

const getPlanShoroByDate = async (date) => {
        let object = await PlanShoro.findOne({date: date});
        return object
}

const deletePlanShoro = async (id) => {
        await PlanShoro.deleteMany({date: {$in: id}});
}

module.exports.deletePlanShoro = deletePlanShoro;
module.exports.getPlanShoro = getPlanShoro;
module.exports.setPlanShoro = setPlanShoro;
module.exports.addPlanShoro = addPlanShoro;
module.exports.getPlanShoroByDate = getPlanShoroByDate;
module.exports.getPlanShoroOrganizator = getPlanShoroOrganizator;