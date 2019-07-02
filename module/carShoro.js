const CarShoro = require('../models/carShoro');
const format = require('./const').stringifyDateTime ;
const mongoose = require('mongoose');
const skip1 = require('../module/const').skip;

const getCarShoro = async (search, sort, skip) => {
        let findResult = [], data = [], count;
        const row = [
            'номер',
            'создан'
        ];
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='номер'&&sort[1]=='descending')
            sort = '-number';
        else if(sort[0]=='номер'&&sort[1]=='ascending')
            sort = 'number';
        else if(sort[0]=='создан'&&sort[1]=='descending')
            sort = '-updatedAt';
        else if(sort[0]=='создан'&&sort[1]=='ascending')
            sort = 'updatedAt';
        if(search == ''){
            count = await CarShoro.count();
            findResult = await CarShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await CarShoro.count({
                $or: [
                    {_id: search},
                    {number: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await CarShoro.find({
                $or: [
                    {_id: search},
                    {number: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        } else {
            count = await CarShoro.count({
                $or: [
                    {number: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await CarShoro.find({
                $or: [
                    {number: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].number, format(findResult[i].updatedAt)]);
        }
        console.log({data: data, count: count, row: row})
        return {data: data, count: count, row: row}
}

const getCarNumber = async () => {
    let a = await CarShoro.find().distinct('number').sort();
    return a.sort()
}

const addCarShoro = async (object) => {

        let _object = new CarShoro(object);
        await CarShoro.create(_object);
}

const setCarShoro = async (object, id) => {
        await CarShoro.findOneAndUpdate({number: id}, {$set: object});
}

const deleteCarShoro = async (id) => {
        await CarShoro.deleteMany({number: {$in: id}});
}

module.exports.deleteCarShoro = deleteCarShoro;
module.exports.getCarShoro = getCarShoro;
module.exports.setCarShoro = setCarShoro;
module.exports.addCarShoro = addCarShoro;
module.exports.getCarNumber = getCarNumber;