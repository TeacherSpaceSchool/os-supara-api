const AdsAzyk = require('../models/adsAzyk');
const { saveFile, deleteFile, urlMain } = require('../module/const');

const type = `
  type Ads {
    _id: ID
    image: String
    url: String
    title: String
    updatedAt: Date
  }
`;

const query = `
    adss(search: String!, sort: String!, filter: String!): [Ads]
    ads: Ads
    sortAds: [Sort]
    filterAds: [Filter]
`;

const mutation = `
    addAds(image: Upload!, url: String!, title: String!): Data
    setAds(_id: ID!, image: Upload, url: String, title: String): Data
    deleteAds(_id: [ID]!): Data
`;

const resolvers = {
    adss: async(parent, {search, sort}) => {
        return await AdsAzyk.find({
            title: {'$regex': search, '$options': 'i'}
        }).sort(sort)
    },
    ads: async() => {
        let ads = await AdsAzyk.findRandom().limit(1)
        return ads[0]
    },
    sortAds: async() => {
        return [
            {
                name: 'Имя',
                field: 'title'
            },
            {
                name: 'Дата',
                field: '-updatedAt'
            },
        ]
    },
    filterAds: async() => {
        return await []
    },
};

const resolversMutation = {
    addAds: async(parent, {image, url, title}, {user}) => {
        if(user.role==='admin'){
            let { stream, filename } = await image;
            filename = await saveFile(stream, filename)
            let _object = new AdsAzyk({
                image: urlMain+filename,
                url: url,
                title: title
            });
            await AdsAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setAds: async(parent, {_id, image, url, title}, {user}) => {
        if(user.role==='admin') {
            let object = await AdsAzyk.findById(_id)
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveFile(stream, filename)
                object.image = urlMain + filename
            }
            if(url) object.url = url
            if(title) object.title = title
            object.save();
        }
        return {data: 'OK'}
    },
    deleteAds: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await AdsAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                await deleteFile(objects[i].image)
            }
            await AdsAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;