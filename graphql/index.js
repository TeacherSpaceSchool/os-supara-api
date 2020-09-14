const { gql, ApolloServer,  } = require('apollo-server-express');
const { RedisPubSub } = require('graphql-redis-subscriptions');
const pubsub = new RedisPubSub();
module.exports.pubsub = pubsub;
const CashConsumableCantSyt = require('./cashConsumableCantSyt');
const RouteCantSyt = require('./routeCantSyt');
const StatisticCantSyt = require('./statisticCantSyt');
const CategoryCantSyt = require('./categoryCantSyt');
const DivisionCantSyt = require('./divisionCantSyt');
const ErrorCantSyt = require('./errorCantSyt');
const FaqCantSyt = require('./faqCantSyt');
const ItemCantSyt = require('./itemCantSyt');
const RoleCantSyt = require('./roleCantSyt');
const UnitCantSyt = require('./unitCantSyt');
const BalanceCantSyt = require('./balanceCantSyt');
const UserCantSyt = require('./userCantSyt');
const ApplicationCantSyt = require('./applicationCantSyt');
const WaybillCantSyt = require('./waybillCantSyt');
const ExpenseReportCantSyt = require('./expenseReportCantSyt');
const SettingCantSyt = require('./settingCantSyt');
const PassportCantSyt = require('./passport');
const { verifydeuserGQL } = require('../module/passport');
const { GraphQLScalarType } = require('graphql');
const ModelsErrorCantSyt = require('../models/errorCantSyt');
const { withFilter } = require('graphql-subscriptions');
const RELOAD_DATA = 'RELOAD_DATA';
let onlineUser = []

const typeDefs = gql`
    scalar Date
    type Data {
       data: String
    }
    type Sort {
        name: String
        field: String
    }
    type Filter {
        name: String
        value: String
    }
    type Currency {
        name: String
        value: Int
    }
    input InputCurrency {
        name: String
        value: Int
    }
    type ReloadData {
        who: ID
        type: String
        ids: [ID]
        roles: [String]
        application: Application
        cashConsumable: CashConsumable 
        waybill: Waybill
        expenseReport: ExpenseReport
        balance: Balance
    }
  type UsedItems {
    name: String
    unit: String
    price: Int
    count: Int
    currency: String
    comment: String
    status: String
    GUID: String
  }
  input InputItems {
    name: String
    unit: String
    price: Int
    count: Int
    currency: String
    comment: String
    status: String
    GUID: String
  }
  type UsedRoutes {
    role: String
    confirmation: Date
    cancel: Date
    comment: String
  }
  input InputRoutes {
    role: String
    confirmation: Date
    cancel: Date
    comment: String
  }
    ${ErrorCantSyt.type}
    ${RouteCantSyt.type}
    ${StatisticCantSyt.type}
    ${CashConsumableCantSyt.type}
    ${FaqCantSyt.type}
    ${PassportCantSyt.type}
    ${CategoryCantSyt.type}
    ${ItemCantSyt.type}
    ${DivisionCantSyt.type}
    ${RoleCantSyt.type}
    ${UnitCantSyt.type}
    ${BalanceCantSyt.type}
    ${UserCantSyt.type}
    ${ApplicationCantSyt.type}
    ${WaybillCantSyt.type}
    ${ExpenseReportCantSyt.type}
    ${SettingCantSyt.type}
    type Mutation {
        ${ErrorCantSyt.mutation}
        ${FaqCantSyt.mutation}
        ${CategoryCantSyt.mutation}
        ${PassportCantSyt.mutation}
        ${ItemCantSyt.mutation}
        ${DivisionCantSyt.mutation}
        ${RouteCantSyt.mutation}
        ${StatisticCantSyt.mutation}
        ${CashConsumableCantSyt.mutation}
        ${RoleCantSyt.mutation}
        ${UnitCantSyt.mutation}
        ${UserCantSyt.mutation}
        ${ApplicationCantSyt.mutation}
        ${WaybillCantSyt.mutation}
        ${ExpenseReportCantSyt.mutation}
        ${SettingCantSyt.mutation}
    }
    type Query {
        ${ErrorCantSyt.query}
        ${FaqCantSyt.query}
        ${CategoryCantSyt.query}
        ${PassportCantSyt.query}
        ${ItemCantSyt.query}
        ${DivisionCantSyt.query}
        ${RouteCantSyt.query}
        ${StatisticCantSyt.query}
        ${CashConsumableCantSyt.query}
        ${RoleCantSyt.query}
        ${UnitCantSyt.query}
        ${BalanceCantSyt.query}
        ${UserCantSyt.query}
        ${ApplicationCantSyt.query}
        ${WaybillCantSyt.query}
        ${ExpenseReportCantSyt.query}
        ${SettingCantSyt.query}
    }
    type Subscription {
        reloadData: ReloadData
    }
`;

const resolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return new Date(value).getTime();
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(ast.value)
            }
            return null;
        },
    }),
    Query: {
        ...ErrorCantSyt.resolvers,
        ...FaqCantSyt.resolvers,
        ...PassportCantSyt.resolvers,
        ...CategoryCantSyt.resolvers,
        ...ItemCantSyt.resolvers,
        ...CashConsumableCantSyt.resolvers,
        ...RouteCantSyt.resolvers,
        ...StatisticCantSyt.resolvers,
        ...DivisionCantSyt.resolvers,
        ...RoleCantSyt.resolvers,
        ...UserCantSyt.resolvers,
        ...ApplicationCantSyt.resolvers,
        ...WaybillCantSyt.resolvers,
        ...ExpenseReportCantSyt.resolvers,
        ...SettingCantSyt.resolvers,
        ...UnitCantSyt.resolvers,
        ...BalanceCantSyt.resolvers,
    },
    Mutation: {
        ...ErrorCantSyt.resolversMutation,
        ...FaqCantSyt.resolversMutation,
        ...CategoryCantSyt.resolversMutation,
        ...PassportCantSyt.resolversMutation,
        ...ItemCantSyt.resolversMutation,
        ...CashConsumableCantSyt.resolversMutation,
        ...RouteCantSyt.resolversMutation,
        ...StatisticCantSyt.resolversMutation,
        ...DivisionCantSyt.resolversMutation,
        ...RoleCantSyt.resolversMutation,
        ...UnitCantSyt.resolversMutation,
        ...UserCantSyt.resolversMutation,
        ...ApplicationCantSyt.resolversMutation,
        ...WaybillCantSyt.resolversMutation,
        ...ExpenseReportCantSyt.resolversMutation,
        ...SettingCantSyt.resolversMutation,
    },
    Subscription: {
        reloadData: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(RELOAD_DATA),
                (payload, variables, {user} ) => {
                    return (
                        user&&user.role&&user._id&&user._id.toString()!==payload.reloadData.who&&
                        (
                            payload.reloadData.roles.includes(user.role)||
                            payload.reloadData.ids.toString().includes(user._id.toString())
                        )
                    )
                },
            )
        },
    }
};

const run = (app)=>{
    const server = new ApolloServer({
        playground: false,
        typeDefs,
        resolvers,
        subscriptions: {
            keepAlive: 1000,
            onConnect: async (connectionParams) => {
                if (connectionParams&&connectionParams.authorization) {
                    let user = await verifydeuserGQL({headers: {authorization: connectionParams.authorization}}, {})
                    return {
                        user: user,
                    }
                }
                else return {
                    user: {}
                }
                //throw new Error('Missing auth token!');
            },
            onDisconnect: (webSocket, context) => {
                // ...
            },
        },
        context: async (ctx) => {
            //console.log(ctx)
            if (ctx.connection) {
                return ctx.connection.context;
            }
            else if(ctx&&ctx.req) {
                let user = await verifydeuserGQL(ctx.req, ctx.res)
                return {req: ctx.req, res: ctx.res, user: user};
            }
        },
        formatError: (err) => {
            console.error(err)

            //logger.info(err.message);
            let _object = new ModelsErrorCantSyt({
                err: err.message,
                path: err.path
            });
            ModelsErrorCantSyt.create(_object)

            return err;
        }
    })
    server.applyMiddleware({ app, path : '/graphql', cors: false })
    return server
    //server.listen().then(({ url }) => {console.log(`🚀  Server ready at ${url}`);});
}

module.exports.run = run;
module.exports.onlineUser = onlineUser;
