const PlanShoro = require('../models/planShoro');
const mongoose = require('mongoose');
const OrganizatorShoro = require('../models/organizatorShoro');
const OtchetRealizatoraShoro = require('../models/otchetRealizatoraShoro');

const getPlanShoroOrganizator = async (search, sort, skip, id) => {
    try{
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
                .limit(10)
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
                .limit(10);
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
                .limit(10);
        }
        for (let i=0; i<findResult.length; i++){
            let findPlanRegions = JSON.parse(findResult[i].regions)
            for (let i1 = 0; i1 < findPlanRegions.length; i1++) {
                if (findPlanRegions[i1]['name'] == region) {
                    data.push([ findResult[i].date, findPlanRegions[i1]['plan'], findPlanRegions[i1]['current']]);
                    break
                }
            }
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const getPlanShoro = async (search, sort, skip) => {
    try{
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
                .limit(10)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
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
                .limit(10);
        } else {
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
                .limit(10);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([ findResult[i].date, findResult[i].norma, findResult[i].current]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const addPlanShoro = async (object) => {
    try{
        object.current = 0
        let findPlanRegions = JSON.parse(object.regions)
        for (let i = 0; i < findPlanRegions.length; i++) {
            findPlanRegions[i]['current'] = 0
            for (let i1 = 0; i1 < findPlanRegions[i]['points'].length; i1++) {
                let findOtchetRealizatoraShoro = await OtchetRealizatoraShoro.find({data: {'$regex': object.date, '$options': 'i'}, region: findPlanRegions[i]['name'], point: findPlanRegions[i]['points'][i1]['name']});
                findPlanRegions[i]['points'][i1]['current'] = 0
                for (let i2 = 0; i2 < findOtchetRealizatoraShoro.length; i2++) {
                    findPlanRegions[i]['points'][i1]['current'] += JSON.parse(findOtchetRealizatoraShoro[i2].dataTable)['i']['fv']
                }
                findPlanRegions[i]['current'] += findPlanRegions[i]['points'][i1]['current']
            }
            object.current += findPlanRegions[i]['current']
        }
        object.regions = JSON.stringify(findPlanRegions)
        let _object = new PlanShoro(object);
        await PlanShoro.create(_object);
    } catch(error) {
        console.error(error)
    }
}

const setPlanShoro = async (object, id) => {
    try{
        await PlanShoro.findOneAndUpdate({_id: id}, {$set: object});
    } catch(error) {
        console.error(error)
    }
}

const getPlanShoroByDate = async (date) => {
    try{
        let object = await PlanShoro.findOne({date: date});
        return object
    } catch(error) {
        console.error(error)
    }
}

const deletePlanShoro = async (id) => {
    try{
        await PlanShoro.deleteMany({date: {$in: id}});
    } catch(error) {
        console.error(error)
    }
}

module.exports.deletePlanShoro = deletePlanShoro;
module.exports.getPlanShoro = getPlanShoro;
module.exports.setPlanShoro = setPlanShoro;
module.exports.addPlanShoro = addPlanShoro;
module.exports.getPlanShoroByDate = getPlanShoroByDate;
module.exports.getPlanShoroOrganizator = getPlanShoroOrganizator;