const FaqShoro = require('../models/faqShoro');
const format = require('./const').stringifyDateTime
const mongoose = require('mongoose');
const skip1 = require('../module/const').skip;

const getFaqShoro1 = async (skip) => {
    try{
       return await FaqShoro
                .find()
                .sort('-createdAt')
                .skip(parseInt(skip))
                .limit(skip1)
    } catch(error) {
        console.error(error)
    }
}

const getFaqShoro = async (search, sort, skip) => {
    try{
        let findResult = [], data = [], count;
        const row = [
            'название',
            'текст',
            'создан',
        ];
        if(sort == undefined||sort=='')
            sort = '-updatedAt';
        else if(sort[0]=='название'&&sort[1]=='descending')
            sort = '-name';
        else if(sort[0]=='название'&&sort[1]=='ascending')
            sort = 'name';
        else if(sort[0]=='текст'&&sort[1]=='descending')
            sort = '-text';
        else if(sort[0]=='текст'&&sort[1]=='ascending')
            sort = 'text';
        else if(sort[0]=='создан'&&sort[1]=='descending')
            sort = '-updatedAt';
        else if(sort[0]=='создан'&&sort[1]=='ascending')
            sort = 'updatedAt';
        if(search == ''){
            count = await FaqShoro.count();
            findResult = await FaqShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await FaqShoro.count({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {text: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await FaqShoro.find({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {text: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else {
            count = await FaqShoro.count({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {text: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await FaqShoro.find({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {text: {'$regex': search, '$options': 'i'}},
                ]
            })
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        }
        for (let i=0; i<findResult.length; i++){
            data.push([findResult[i].name, findResult[i].text, format(findResult[i].updatedAt)]);
        }
        return {data: data, count: count, row: row}
    } catch(error) {
        console.error(error)
    }
}

const addFaqShoro = async (object) => {
    try{
        let _object = new FaqShoro(object);
        await FaqShoro.create(_object);
    } catch(error) {
        console.error(error)
    }
}

const setFaqShoro = async (object, id) => {
    try{
        await FaqShoro.findOneAndUpdate({name: id}, {$set: object});
    } catch(error) {
        console.error(error)
    }
}

const deleteFaqShoro = async (id) => {
    try{
        await FaqShoro.deleteMany({name: {$in: id}});
    } catch(error) {
        console.error(error)
    }
}

module.exports.deleteFaqShoro = deleteFaqShoro;
module.exports.getFaqShoro = getFaqShoro;
module.exports.setFaqShoro = setFaqShoro;
module.exports.addFaqShoro = addFaqShoro;
module.exports.getFaqShoro1 = getFaqShoro1;