const AdsAzyk = require('../models/adsAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const { saveImage, deleteFile, urlMain } = require('../module/const');

const type = `
  type Ads {
    _id: ID
    image: String
    url: String
    title: String
    createdAt: Date
    del: String
    organization: Organization
  }
`;

const query = `
    adss(search: String!, organization: ID!): [Ads]
    adssTrash(search: String!): [Ads]
    adsOrganizations: [Organization]
    ads: Ads
`;

const mutation = `
    addAds(image: Upload!, url: String!, title: String!, organization: ID!): Data
    setAds(_id: ID!, image: Upload, url: String, title: String): Data
    restoreAds(_id: [ID]!): Data
    deleteAds(_id: [ID]!): Data
`;

const resolvers = {
    adssTrash: async(parent, {search}) => {
        return await AdsAzyk.find({
            del: 'deleted',
            title: {'$regex': search, '$options': 'i'}
        }).sort('-createdAt')
    },
    adss: async(parent, {search, organization}) => {
        return await AdsAzyk.find({
            del: {$ne: 'deleted'},
            title: {'$regex': search, '$options': 'i'},
            organization: organization
        }).sort('-createdAt')
    },
    adsOrganizations: async() => {
        let organizations = await AdsAzyk.find({del: {$ne: 'deleted'}}).distinct('organization')
        organizations = await OrganizationAzyk.find({
            _id: {$in: organizations},
            status: 'active',
            del: {$ne: 'deleted'}}).sort('name')
        return organizations
    },
    ads: async() => {
        let ads = await AdsAzyk.findRandom().limit(1)
        return ads[0]
    }
};

const resolversMutation = {
    addAds: async(parent, {image, url, title, organization}, {user}) => {
        if(['организация', 'admin'].includes(user.role)){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
            let _object = new AdsAzyk({
                image: urlMain+filename,
                url: url,
                title: title,
                organization: organization
            });
            if(['организация'].includes(user.role)) _object.organization = user.organization
            await AdsAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setAds: async(parent, {_id, image, url, title}, {user}) => {
        if(['организация', 'admin'].includes(user.role)){
            let object = await AdsAzyk.findById(_id)
            if (image) {
                let {stream, filename} = await image;
                await deleteFile(object.image)
                filename = await saveImage(stream, filename)
                object.image = urlMain + filename
            }
            if(url) object.url = url
            if(title) object.title = title
            object.save();
        }
        return {data: 'OK'}
    },
    restoreAds: async(parent, { _id }, {user}) => {
        if('admin'===user.role){
            await AdsAzyk.updateMany({_id: {$in: _id}}, {del: null})
        }
        return {data: 'OK'}
    },
    deleteAds: async(parent, { _id }, {user}) => {
        if(['организация', 'admin'].includes(user.role)){
            let objects = await AdsAzyk.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                await deleteFile(objects[i].image)
            }
            await AdsAzyk.updateMany({_id: {$in: _id}}, {del: 'deleted'})

        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;