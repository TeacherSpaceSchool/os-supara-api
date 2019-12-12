const { gql, ApolloServer, PubSub } = require('apollo-server-express');
//const { gql, ApolloServer, PubSub } = require('apollo-server');
const AdsAzyk = require('./adsAzyk');
const BlogAzyk = require('./blogAzyk');
const CategoryAzyk = require('./categoryAzyk');
const SubCategoryAzyk = require('./subCategoryAzyk');
const OrganizationAzyk = require('./organizationAzyk');
const ContactAzyk = require('./contactAzyk');
const ClientAzyk = require('./clientAzyk');
const EmploymentAzyk = require('./employmentAzyk');
const ItemAzyk = require('./itemAzyk');
const BasketAzyk = require('./basketAzyk');
const OrderAzyk = require('./orderAzyk');
const BonusAzyk = require('./bonusAzyk');
const BonusClientAzyk = require('./bonusClientAzyk');
const PassportAzyk = require('./passport');
const RouteAzyk = require('./routeAzyk');
const { verifydeuserGQL } = require('../module/passport');
const { GraphQLScalarType } = require('graphql');
module.exports.pubsub = new PubSub();

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
    type Social {
        url: String
        image: String
    }
    ${AdsAzyk.type}
    ${ClientAzyk.type}
    ${OrganizationAzyk.type}
    ${BlogAzyk.type}
    ${PassportAzyk.type}
    ${CategoryAzyk.type}
    ${SubCategoryAzyk.type}
    ${EmploymentAzyk.type}
    ${ItemAzyk.type}
    ${ContactAzyk.type}
    ${BasketAzyk.type}
    ${OrderAzyk.type}
    ${RouteAzyk.type}
    ${BonusAzyk.type}
    ${BonusClientAzyk.type}
    type Mutation {
        ${AdsAzyk.mutation}
        ${ClientAzyk.mutation}
        ${OrganizationAzyk.mutation}
        ${CategoryAzyk.mutation}
        ${SubCategoryAzyk.mutation}
        ${BlogAzyk.mutation}
        ${PassportAzyk.mutation}
        ${EmploymentAzyk.mutation}
        ${ItemAzyk.mutation}
        ${ContactAzyk.mutation}
        ${BasketAzyk.mutation}
        ${OrderAzyk.mutation}
        ${RouteAzyk.mutation}
        ${BonusAzyk.mutation}
        ${BonusClientAzyk.mutation}
    }
    type Query {
        ${ClientAzyk.query}
        ${OrganizationAzyk.query}
        ${AdsAzyk.query}
        ${CategoryAzyk.query}
        ${SubCategoryAzyk.query}
        ${BlogAzyk.query}
        ${PassportAzyk.query}
        ${EmploymentAzyk.query}
        ${ItemAzyk.query}
        ${ContactAzyk.query}
        ${BasketAzyk.query}
        ${OrderAzyk.query}
        ${RouteAzyk.query}
        ${BonusAzyk.query}
        ${BonusClientAzyk.query}
    }
    type Subscription {
        ${OrderAzyk.subscription}
        ${BasketAzyk.subscription}
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
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(ast.value)
            }
            return null;
        },
    }),
    Query: {
        ...ClientAzyk.resolvers,
        ...OrganizationAzyk.resolvers,
        ...BlogAzyk.resolvers,
        ...AdsAzyk.resolvers,
        ...PassportAzyk.resolvers,
        ...CategoryAzyk.resolvers,
        ...EmploymentAzyk.resolvers,
        ...SubCategoryAzyk.resolvers,
        ...ItemAzyk.resolvers,
        ...ContactAzyk.resolvers,
        ...BasketAzyk.resolvers,
        ...OrderAzyk.resolvers,
        ...RouteAzyk.resolvers,
        ...BonusAzyk.resolvers,
        ...BonusClientAzyk.resolvers,
    },
    Mutation: {
        ...ClientAzyk.resolversMutation,
        ...OrganizationAzyk.resolversMutation,
        ...CategoryAzyk.resolversMutation,
        ...SubCategoryAzyk.resolversMutation,
        ...BlogAzyk.resolversMutation,
        ...AdsAzyk.resolversMutation,
        ...EmploymentAzyk.resolversMutation,
        ...PassportAzyk.resolversMutation,
        ...ItemAzyk.resolversMutation,
        ...ContactAzyk.resolversMutation,
        ...BasketAzyk.resolversMutation,
        ...OrderAzyk.resolversMutation,
        ...RouteAzyk.resolversMutation,
        ...BonusAzyk.resolversMutation,
        ...BonusClientAzyk.resolversMutation,
    },
    Subscription: {
        ...OrderAzyk.resolversSubscription,
        ...BasketAzyk.resolversSubscription,
    }
};

const run = (app)=>{
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req, res }) => {
            let user = await verifydeuserGQL(req, res)
             return { req: req, res: res, user: user };
        },
        formatError: (err) => {
            console.error(err)
            return err;
        },
    })
    server.applyMiddleware({ app, path : '/graphql', cors: false })
    return server
    //server.listen().then(({ url }) => {console.log(`🚀  Server ready at ${url}`);});
}

module.exports.run = run;
