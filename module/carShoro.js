const CarShoro = require('../models/carShoro');
const format = require('./const').stringifyDateTime ;
const mongoose = require('mongoose');

const getCarShoro = async (search, sort, skip) => {
    try{
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
                .limit(10)
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
                .limit(10);
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
                .limit(10);
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].number, format(findResult[i].updatedAt)]);
        }
        console.log({data: data, count: count, row: row})
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const getCarNumber = async () => {
    try{
        console.log(await CarShoro.find().distinct('number'))
       return await CarShoro.find().distinct('number');
    } catch(error) {
        console.error(error)
    }
}

const addCarShoro = async (object) => {
    try{
        console.log(object)
        let _object = new CarShoro(object);
        await CarShoro.create(_object);
    } catch(error) {
        console.error(error)
    }
}

const setCarShoro = async (object, id) => {
    try{
        await CarShoro.findOneAndUpdate({number: id}, {$set: object});
    } catch(error) {
        console.error(error)
    }
}

const deleteCarShoro = async (id) => {
    try{
        await CarShoro.deleteMany({number: {$in: id}});
    } catch(error) {
        console.error(error)
    }
}

module.exports.deleteCarShoro = deleteCarShoro;
module.exports.getCarShoro = getCarShoro;
module.exports.setCarShoro = setCarShoro;
module.exports.addCarShoro = addCarShoro;
module.exports.getCarNumber = getCarNumber;