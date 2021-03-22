const { gql, ApolloServer } = require('apollo-server-express');
const { RedisPubSub } = require('graphql-redis-subscriptions');
const pubsub = new RedisPubSub();
module.exports.pubsub = pubsub;
const CashConsumableOsSupara = require('./cashConsumable');
const RouteOsSupara = require('./route');
const StatisticOsSupara = require('./statistic');
const CategoryOsSupara = require('./category');
const DivisionOsSupara = require('./division');
const ErrorOsSupara = require('./error');
const FaqOsSupara = require('./faq');
const ItemOsSupara = require('./item');
const CashExchange = require('./cashExchange');
const SubdivisionOsSupara = require('./subdivision');
const RoleOsSupara = require('./role');
const UnitOsSupara = require('./unit');
const SellerOsSupara = require('./seller');
const BalanceOsSupara = require('./balance');
const BalanceHistoryOsSupara = require('./balanceHistory');
const Balance1CHistoryOsSupara = require('./balance1CHistory');
const UserOsSupara = require('./user');
const ApplicationOsSupara = require('./application');
const StorageOsSupara = require('./storage');
const MemorandumOsSupara = require('./memorandum');
const AutoApplicationOsSupara = require('./autoApplication');
const WaybillOsSupara = require('./waybill');
const ExpenseReportOsSupara = require('./expenseReport');
const SettingOsSupara = require('./setting');
const PassportOsSupara = require('./passport');
const { verifydeuserGQL } = require('../module/passport');
const { GraphQLScalarType } = require('graphql');
const ModelsErrorOsSupara = require('../models/error');
const { withFilter } = require('graphql-subscriptions');
const RELOAD_DATA = 'RELOAD_DATA';

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
        value: Float
    }
    input InputCurrency {
        name: String
        value: Float
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
        cashExchange: CashExchange
        memorandum: Memorandum
    }
  type UsedItems {
    name: String
    unit: String
    price: Float
    count: Float
    currency: String
    comment: String
    status: String
    GUID: String
  }
  input InputItems {
    name: String
    unit: String
    price: Float
    count: Float
    currency: String
    comment: String
    status: String
    GUID: String
  }
  type UsedRoutes {
    role: String
    user: User
    confirmation: Date
    cancel: Date
    comment: String
  }
  input InputRoutes {
    role: String
    user: ID
    confirmation: Date
    cancel: Date
    comment: String
  }
    ${ErrorOsSupara.type}
    ${RouteOsSupara.type}
    ${StatisticOsSupara.type}
    ${CashConsumableOsSupara.type}
    ${FaqOsSupara.type}
    ${PassportOsSupara.type}
    ${CategoryOsSupara.type}
    ${ItemOsSupara.type}
    ${CashExchange.type}
    ${SubdivisionOsSupara.type}
    ${DivisionOsSupara.type}
    ${RoleOsSupara.type}
    ${UnitOsSupara.type}
    ${SellerOsSupara.type}
    ${BalanceOsSupara.type}
    ${BalanceHistoryOsSupara.type}
    ${Balance1CHistoryOsSupara.type}
    ${UserOsSupara.type}
    ${AutoApplicationOsSupara.type}
    ${StorageOsSupara.type}
    ${ApplicationOsSupara.type}
    ${MemorandumOsSupara.type}
    ${WaybillOsSupara.type}
    ${ExpenseReportOsSupara.type}
    ${SettingOsSupara.type}
    type Mutation {
        ${ErrorOsSupara.mutation}
        ${FaqOsSupara.mutation}
        ${CategoryOsSupara.mutation}
        ${PassportOsSupara.mutation}
        ${ItemOsSupara.mutation}
        ${CashExchange.mutation}
        ${SubdivisionOsSupara.mutation}
        ${DivisionOsSupara.mutation}
        ${RouteOsSupara.mutation}
        ${StatisticOsSupara.mutation}
        ${CashConsumableOsSupara.mutation}
        ${RoleOsSupara.mutation}
        ${UnitOsSupara.mutation}
        ${SellerOsSupara.mutation}
        ${UserOsSupara.mutation}
        ${AutoApplicationOsSupara.mutation}
        ${ApplicationOsSupara.mutation}
        ${MemorandumOsSupara.mutation}
        ${WaybillOsSupara.mutation}
        ${ExpenseReportOsSupara.mutation}
        ${SettingOsSupara.mutation}
    }
    type Query {
        ${ErrorOsSupara.query}
        ${FaqOsSupara.query}
        ${CategoryOsSupara.query}
        ${PassportOsSupara.query}
        ${ItemOsSupara.query}
        ${CashExchange.query}
        ${SubdivisionOsSupara.query}
        ${DivisionOsSupara.query}
        ${RouteOsSupara.query}
        ${StatisticOsSupara.query}
        ${CashConsumableOsSupara.query}
        ${RoleOsSupara.query}
        ${UnitOsSupara.query}
        ${SellerOsSupara.query}
        ${BalanceOsSupara.query}
        ${BalanceHistoryOsSupara.query}
        ${Balance1CHistoryOsSupara.query}
        ${UserOsSupara.query}
        ${AutoApplicationOsSupara.query}
        ${StorageOsSupara.query}
        ${ApplicationOsSupara.query}
        ${MemorandumOsSupara.query}
        ${WaybillOsSupara.query}
        ${ExpenseReportOsSupara.query}
        ${SettingOsSupara.query}
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
        ...ErrorOsSupara.resolvers,
        ...FaqOsSupara.resolvers,
        ...PassportOsSupara.resolvers,
        ...CategoryOsSupara.resolvers,
        ...ItemOsSupara.resolvers,
        ...CashExchange.resolvers,
        ...SubdivisionOsSupara.resolvers,
        ...CashConsumableOsSupara.resolvers,
        ...RouteOsSupara.resolvers,
        ...StatisticOsSupara.resolvers,
        ...DivisionOsSupara.resolvers,
        ...RoleOsSupara.resolvers,
        ...UserOsSupara.resolvers,
        ...AutoApplicationOsSupara.resolvers,
        ...StorageOsSupara.resolvers,
        ...ApplicationOsSupara.resolvers,
        ...MemorandumOsSupara.resolvers,
        ...WaybillOsSupara.resolvers,
        ...ExpenseReportOsSupara.resolvers,
        ...SettingOsSupara.resolvers,
        ...UnitOsSupara.resolvers,
        ...SellerOsSupara.resolvers,
        ...BalanceOsSupara.resolvers,
        ...BalanceHistoryOsSupara.resolvers,
        ...Balance1CHistoryOsSupara.resolvers,
    },
    Mutation: {
        ...ErrorOsSupara.resolversMutation,
        ...FaqOsSupara.resolversMutation,
        ...CategoryOsSupara.resolversMutation,
        ...PassportOsSupara.resolversMutation,
        ...ItemOsSupara.resolversMutation,
        ...CashExchange.resolversMutation,
        ...SubdivisionOsSupara.resolversMutation,
        ...CashConsumableOsSupara.resolversMutation,
        ...RouteOsSupara.resolversMutation,
        ...StatisticOsSupara.resolversMutation,
        ...DivisionOsSupara.resolversMutation,
        ...RoleOsSupara.resolversMutation,
        ...UnitOsSupara.resolversMutation,
        ...SellerOsSupara.resolversMutation,
        ...UserOsSupara.resolversMutation,
        ...AutoApplicationOsSupara.resolversMutation,
        ...ApplicationOsSupara.resolversMutation,
        ...MemorandumOsSupara.resolversMutation,
        ...WaybillOsSupara.resolversMutation,
        ...ExpenseReportOsSupara.resolversMutation,
        ...SettingOsSupara.resolversMutation,
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
            let _object = new ModelsErrorOsSupara({
                err: err.message,
                path: err.path
            });
            ModelsErrorOsSupara.create(_object)

            return err;
        }
    })
    server.applyMiddleware({ app, path : '/graphql', cors: false })
    return server
    //server.listen().then(({ url }) => {console.log(`🚀  Server ready at ${url}`);});
}

module.exports.run = run;
