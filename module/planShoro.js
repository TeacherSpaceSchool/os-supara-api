const PlanShoro = require('../models/planShoro');
const mongoose = require('mongoose');
const OrganizatorShoro = require('../models/organizatorShoro');

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
            sort = '-phone';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'phone';
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
            sort = '-phone';
        else if(sort[0]=='дата'&&sort[1]=='ascending')
            sort = 'phone';
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
        for(let i=0; i<id.length; i++) {
            await PlanShoro.deleteMany({date: {$in: id}});
        }
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