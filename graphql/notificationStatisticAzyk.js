const NotificationStatisticAzyk = require('../models/notificationStatisticAzyk');
const {sendWebPush} = require('../module/webPush');

const type = `
  type NotificationStatistic {
    _id: ID
    createdAt: Date
    title: String
    text: String
    delivered: Int
    failed: Int
  }
`;

const query = `
    notificationStatistics(search: String!): [NotificationStatistic]
`;

const mutation = `
    addNotificationStatistic(text: String!, title: String!): Data
`;

const resolvers = {
    notificationStatistics: async(parent, {search}, {user}) => {
        if('admin'===user.role)
            return await NotificationStatisticAzyk.find({
                $or: [
                    {title: {'$regex': search, '$options': 'i'}},
                    {text: {'$regex': search, '$options': 'i'}}
                ]
            }).sort('-createdAt')
        else
            return []
    }
};

const resolversMutation = {
    addNotificationStatistic: async(parent, {text, title}, {user}) => {
        if('admin'===user.role){
            sendWebPush(title, text, 'all')
        }
        return {data: 'OK'};
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;