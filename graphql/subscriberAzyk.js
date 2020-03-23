const ClientAzyk = require('../models/clientAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const SubscriberAzyk = require('../models/subscriberAzyk');

const type = `
  type Subscriber {
    _id: ID
    createdAt: Date
    user: String
    number: String
    status: String
  }
`;

const query = `
    subscribers: [Subscriber]
`;

const mutation = `
    deleteSubscriber(_id: [ID]!): Data
`;

const resolvers = {
    subscribers: async(parent, ctx, {user}) => {
        let res = []
        if('admin'===user.role){
            res = await SubscriberAzyk
                .find({})
                .populate({ path: 'user' })
                .sort('-createdAt')
            for(let i=0; i<res.length; i++){
                console.log(
                    res[i]
                )
                if(res[i].user){
                    if('admin'===res[i].user.role) {
                        res[i].user = 'admin'
                    }
                    else if('client'===res[i].user.role) {
                        let client = await ClientAzyk.findOne({user: res[i].user._id})
                        res[i].user=`${client.name}${client.address&&client.address[0]?` (${client.address[0][2]?`${client.address[0][2]}, `:''}${client.address[0][0]})`:''}`
                    }
                    else if(['суперагент', 'суперменеджер'].includes(res[i].user.role)) {
                        let employment = await EmploymentAzyk.findOne({user: res[i].user._id})
                        res[i].user = `${res[i].user.role} ${employment.name}`
                    }
                    else {
                        let employment = await EmploymentAzyk.findOne({user: res[i].user._id}).populate({ path: 'organization' })
                        res[i].user = `${employment.organization.name} ${res[i].user.role} ${employment.name}`
                    }
                }
                else {
                    res[i].user = 'неидентифицированные'
                }
            }
        }

        return res
    }
};

const resolversMutation = {
    deleteSubscriber: async(parent, { _id }, {user}) => {
        if('admin'===user.role){
            await SubscriberAzyk.deleteMany({_id: {$in: _id}})
        }
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;