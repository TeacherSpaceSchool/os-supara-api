const Integrate1CAzyk = require('../models/integrate1CAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const ClientAzyk = require('../models/clientAzyk');
const ItemAzyk = require('../models/itemAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');
const OrderAzyk = require('../models/orderAzyk');
const mongoose = require('mongoose');

const type = `
  type Integrate1C {
      _id: ID
      createdAt: Date
      guid: String
      organization: Organization
      ecspeditor: Employment
      client: Client
      agent: Employment
      item: Item
  }
`;

const query = `
    integrate1Cs(organization: ID!, search: String!, filter: String!): [Integrate1C]
    integrate1C(_id: ID!): Integrate1C
    ecspeditorsIntegrate1C(organization: ID!): [Employment]
    agentsIntegrate1C(organization: ID!): [Employment]
    itemsIntegrate1C(organization: ID!): [Item]
    clientsIntegrate1C(organization: ID!): [Client]
    filterIntegrate1C: [Filter]
`;

const mutation = `
    addIntegrate1C(organization: ID!, item: ID, client: ID, guid: String, agent: ID, ecspeditor: ID): Data
    setIntegrate1C(_id: ID!, item: ID, client: ID, guid: String, agent: ID, ecspeditor: ID): Data
    deleteIntegrate1C(_id: [ID]!): Data
`;

const resolvers = {
    integrate1Cs: async(parent, {search, filter, organization}, {user}) => {
        if(user.role==='admin'){
            let integrate1Cs =  await Integrate1CAzyk
                .find({
                    organization: organization,
                    ...(
                        filter==='агент'?
                            {agent: {$ne: null}}
                            :
                            filter==='экспедитор'?
                                {ecspeditor: {$ne: null}}
                                :
                                filter==='товар'?
                                    {item: {$ne: null}}
                                    :
                                    filter==='клиент'?
                                        {client: {$ne: null}}
                                        :
                                        {}
                        )
                })
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
                .populate('item')
            integrate1Cs = integrate1Cs.filter(
                integrate1C =>
                    (integrate1C.guid.toLowerCase()).includes(search.toLowerCase()) ||
                    (integrate1C.agent&&integrate1C.agent.name.toLowerCase().includes(search.toLowerCase()))||
                    (integrate1C.client&&integrate1C.client.name.toLowerCase().includes(search.toLowerCase()))||
                    (integrate1C.ecspeditor&&integrate1C.ecspeditor.name.toLowerCase().includes(search.toLowerCase()))||
                    (integrate1C.item&&integrate1C.item.name.toLowerCase().includes(search.toLowerCase()))
            )
            for(let i=0; i<integrate1Cs.length; i++){
                if(integrate1Cs[i].client)
                    for(let i1=0; i1<integrate1Cs[i].client.address.length; i1++) {
                        integrate1Cs[i].client.name+=` | ${integrate1Cs[i].client.address[i1][2]?`${integrate1Cs[i].client.address[i1][2]}, `:''}${integrate1Cs[i].client.address[i1][0]}`
                    }
            }
            return integrate1Cs
        }
    },
    integrate1C: async(parent, {_id}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(_id)&&user.role==='admin'){
            return await Integrate1CAzyk
                .findOne({_id: _id})
                .populate('agent')
                .populate('client')
                .populate('ecspeditor')
                .populate('organization')
                .populate('item')
        }
        else return null
    },
    ecspeditorsIntegrate1C: async(parent, {organization}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(organization)&&user.role==='admin') {
            let ecspeditors =  await Integrate1CAzyk
                .find({
                    organization: organization,
                    ecspeditor: {$ne: null}
                })
                .distinct('ecspeditor')
            ecspeditors = await EmploymentAzyk.find({
                organization: organization,
                _id: {$nin: ecspeditors},
            })
                .populate({path: 'user', match: {role: 'экспедитор', status: 'active'}})
            ecspeditors = ecspeditors.filter(ecspeditor => (ecspeditor.user))
            return ecspeditors
        }
        else return []
    },
    agentsIntegrate1C: async(parent, {organization}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(organization)&&user.role==='admin') {
            let agents =  await Integrate1CAzyk
                .find({
                    organization: organization,
                    agent: {$ne: null}
                })
                .distinct('agent')
            agents = await EmploymentAzyk.find({
                organization: organization,
                _id: {$nin: agents},
            })
                .populate({path: 'user', match: {role: 'агент', status: 'active'}})
            agents = agents.filter(agent => (agent.user))
            return agents
        }
        else return []
    },
    clientsIntegrate1C: async(parent, {organization}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(organization)&&user.role==='admin') {
            let clients =  await Integrate1CAzyk
                .find({
                    organization: organization,
                    client: {$ne: null}
                })
                .distinct('client')
            organization = await OrganizationAzyk.findOne({_id: organization})
            if(organization.accessToClient)
                clients = await ClientAzyk.find({
                    _id: {$nin: clients},
                    del: {$ne: 'deleted'}
                })
                    .populate({path: 'user', match: {status: 'active'}})
            else {
                let items = await ItemAzyk.find({organization: user.organization}).distinct('_id')
                clients = await OrderAzyk.find({item: {$in: items}}).distinct('client')
                clients = await ClientAzyk.find({
                    _id: { $nin: clients},
                    $or: [{_id: {$in: clients}}, {organization: user.organization}],
                    del: {$ne: 'deleted'}
                }).populate({
                    path: 'user',
                    match: {status: 'active'}
                }).populate({path: 'organization'})
            }
            clients = clients.filter(client => (
                client.user&&
                client.address[0]&&
                client.address[0][1]&&
                client.address[0][1].length>0&&
                !(client.name.toLowerCase()).includes('агент')&&
                !(client.name.toLowerCase()).includes('agent'))
            )
            for(let i=0; i<clients.length; i++){
                for(let i1=0; i1<clients[i].address.length; i1++) {
                    clients[i].name+=` | ${clients[i].address[i1][2]?`${clients[i].address[i1][2]}, `:''}${clients[i].address[i1][0]}`
                }
            }
            return clients
        }
        else return []
    },
    itemsIntegrate1C: async(parent, {organization}, {user}) => {
        if(mongoose.Types.ObjectId.isValid(organization)&&user.role==='admin') {
            let items =  await Integrate1CAzyk
                .find({
                    organization: organization,
                    item: {$ne: null}
                })
                .distinct('item')
            items = await ItemAzyk.find({
                _id: {$nin: items},
                status: 'active',
                organization: organization,
                del: {$ne: 'deleted'}
            })
            return items
        }
        else return []
    },
    filterIntegrate1C: async(parent, ctx, {user}) => {
        let filter = []
        if(user.role==='admin'){
            filter = [
                {
                    name: 'Все',
                    value: ''
                },
                {
                    name: 'Агент',
                    value: 'агент'
                },
                {
                    name: 'Экспедитор',
                    value: 'экспедитор'
                },
                {
                    name: 'Товар',
                    value: 'товар'
                },
                {
                    name: 'Клиент',
                    value: 'клиент'
                },
            ]
            return filter
        }
    },
};

const resolversMutation = {
    addIntegrate1C: async(parent, {organization, item, client, guid, agent, ecspeditor}, {user}) => {
        if(['admin'].includes(user.role)){
            let _object = new Integrate1CAzyk({
                item: item,
                client: client,
                agent: agent,
                ecspeditor: ecspeditor,
                organization: organization,
                guid: guid,
            });
            await Integrate1CAzyk.create(_object)
        }
        return {data: 'OK'};
    },
    setIntegrate1C: async(parent, {_id, item, client, guid, agent, ecspeditor}, {user}) => {
        if(user.role==='admin') {
            let object = await Integrate1CAzyk.findById(_id)
            if(guid)object.guid = guid
            object.client = client
            object.agent = agent
            object.item = item
            object.ecspeditor = ecspeditor
            object.save();
        }
        return {data: 'OK'}
    },
    deleteIntegrate1C: async(parent, { _id }, {user}) => {
        if(user.role==='admin')
            await Integrate1CAzyk.deleteMany({_id: {$in: _id}})
        return {data: 'OK'}
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;