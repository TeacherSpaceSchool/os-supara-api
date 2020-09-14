const FaqCantSyt = require('../models/faqCantSyt');
const { saveFile, deleteFile, urlMain } = require('../module/const');

const type = `
  type Faq {
    _id: ID
    url: String
    title: String
    video: String
    createdAt: Date
  }
`;

const query = `
    faqs(search: String!): [Faq]
`;

const mutation = `
    addFaq(file: Upload, title: String!,  video: String): Data
    setFaq(_id: ID!, file: Upload, title: String, video: String): Data
    deleteFaq(_id: [ID]!): Data
`;

const resolvers = {
    faqs: async(parent, {search}) => {
        let res =  await FaqCantSyt.find({
            title: {'$regex': search, '$options': 'i'},
        }).sort('title')
        return res
    }
};

const resolversMutation = {
    addFaq: async(parent, {file, title, video}, {user}) => {
        if(user.role==='admin') {
            let _object = new FaqCantSyt({
                title: title,
            });
            if (file) {
                let {stream, filename} = await file;
                filename = await saveFile(stream, filename)
                _object.url = urlMain+filename
            }
            if(video)_object.video = video
            await FaqCantSyt.create(_object)
        }
        return {data: 'OK'};
    },
    setFaq: async(parent, {_id, file, title, video}, {user}) => {
        if(user.role==='admin') {
            let object = await FaqCantSyt.findById(_id)
            if (file) {
                let {stream, filename} = await file;
                if(object.url) await deleteFile(object.url)
                 filename = await saveFile(stream, filename)
                object.url = urlMain + filename
            }
            if(title) object.title = title
            if(video) object.video = video
            object.save();
        }
        return {data: 'OK'}
    },
    deleteFaq: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let objects = await FaqCantSyt.find({_id: {$in: _id}})
            for(let i=0; i<objects.length; i++){
                if(objects[i].file)
                    await deleteFile(objects[i].file)
            }
            await FaqCantSyt.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;