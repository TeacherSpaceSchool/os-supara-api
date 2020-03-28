const AgentHistoryGeoAzyk = require('../models/agentHistoryGeoAzyk');
const {getGeoDistance, pdDDMMYYYY} = require('../module/const');

const type = `
  type AgentHistoryGeo {
    _id: ID
    createdAt: Date
    geo: String
    client: Client
    agent: Employment
  }
`;

const query = `
    agentHistoryGeos(agent: ID!, date: String): Statistic
`;

const mutation = `
    addAgentHistoryGeo(client: ID!, geo: String!): Data
`;

const resolvers = {
    agentHistoryGeos: async(parent, {agent, date}) => {
        let dateStart = date?new Date(date):new Date()
        dateStart.setHours(3, 0, 0, 0)
        let dateEnd = new Date(dateStart)
        dateEnd.setDate(dateEnd.getDate() + 1)
        let data = []
        let agentHistoryGeoAzyks = await AgentHistoryGeoAzyk.find({
            $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt:dateEnd}}],
            agent: agent
        })
            .populate('client')
            .sort('-createdAt')
        for(let i=0; i<agentHistoryGeoAzyks.length; i++){
            data.push({
                _id: agentHistoryGeoAzyks[i]._id,
                data: [
                    pdDDMMYYYY(agentHistoryGeoAzyks[i].createdAt),
                    `${agentHistoryGeoAzyks[i].client.name}${agentHistoryGeoAzyks[i].client.address&&agentHistoryGeoAzyks[i].client.address[0]?` (${agentHistoryGeoAzyks[i].client.address[0][2]?`${agentHistoryGeoAzyks[i].client.address[0][2]}, `:''}${agentHistoryGeoAzyks[i].client.address[0][0]})`:''}`,
                    `${getGeoDistance(...(agentHistoryGeoAzyks[i].geo.split(', ')), ...(agentHistoryGeoAzyks[i].client.address[0][1].split(', ')))} м`
                ]
            })
        }
        return {
            columns: ['дата', 'клиент', 'растояние'],
            row: data
        };

    },
};

const resolversMutation = {
    addAgentHistoryGeo: async(parent, {client, geo}, {user}) => {
        if(['агент', 'суперагент'].includes(user.role)){
            let _object = new AgentHistoryGeoAzyk({
                agent: user.employment,
                client: client,
                geo: geo
            })
            await AgentHistoryGeoAzyk.create(_object)
        }
        return {data: 'OK'};
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;