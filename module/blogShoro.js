const BlogShoro = require('../models/blogShoro');
const format = require('./const').stringifyDateTime
const mongoose = require('mongoose');
const skip1 = require('../module/const').skip;

const getBlogShoro1 = async (skip) => {
       return await BlogShoro
                .find()
                .sort('-createdAt')
                .skip(parseInt(skip))
                .limit(skip1)
}

const getBlogShoro = async (search, sort, skip) => {
        let findResult = [], data = [], count;
        const row = [
            'изображение',
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
            count = await BlogShoro.count();
            findResult = await BlogShoro
                .find()
                .sort(sort)
                .skip(parseInt(skip))
                .limit(skip1)
        } else if (mongoose.Types.ObjectId.isValid(search)) {
            count = await BlogShoro.count({
                $or: [
                    {_id: search},
                    {name: {'$regex': search, '$options': 'i'}},
                    {text: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await BlogShoro.find({
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
            count = await BlogShoro.count({
                $or: [
                    {name: {'$regex': search, '$options': 'i'}},
                    {text: {'$regex': search, '$options': 'i'}},
                ]
            });
            findResult = await BlogShoro.find({
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
            let image = ''
            if(findResult[i].image!=undefined){
                image=findResult[i].image.toString();
            }
            while(image.includes(',http://'))
                image = image.replace(',http://', '\nhttp://');
            data.push([image, findResult[i].name, findResult[i].text, format(findResult[i].updatedAt)]);
        }
        return {data: data, count: count, row: row}
   }

const addBlogShoro = async (object) => {
        let _object = new BlogShoro(object);
        await BlogShoro.create(_object);
   }

const setBlogShoro = async (object, id) => {
        await BlogShoro.findOneAndUpdate({name: id}, {$set: object});

}

const deleteBlogShoro = async (id) => {
        await BlogShoro.deleteMany({name: {$in: id}});

}

module.exports.deleteBlogShoro = deleteBlogShoro;
module.exports.getBlogShoro = getBlogShoro;
module.exports.setBlogShoro = setBlogShoro;
module.exports.addBlogShoro = addBlogShoro;
module.exports.getBlogShoro1 = getBlogShoro1;