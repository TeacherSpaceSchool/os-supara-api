const { signupuserGQL, signinuserGQL } = require('../module/passport');

const type = `
  type Status {
    role: String
    status: String
    login: String
    _id: ID
  }
`;

const query = `
       getStatus: Status
`;

const resolvers = {
    getStatus: async(parent, args, {user}) => {
        return {
            role: user.role,
            status: user.status,
            login: user.login,
            _id: user._id
        }
    },
};

const mutation = `
    signupuser(login: String, password: String): Status
    signinuser(login: String!, password: String!): Status
`;

const resolversMutation = {
    signupuser: async(parent, { login, password}, {res}) => {
        return await signupuserGQL({ login: login, password: password }, res);
    },
    signinuser: async(parent, { login, password}, {req, res}) => {
        return await signinuserGQL({ ...req, query: {login: login, password: password}}, res);
    },
};

module.exports.resolvers = resolvers;
module.exports.query = query;
module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;