const { signupuserGQL, signinuserGQL } = require('../module/passport');

const type = `
  type Status {
    role: String
    status: String
    phone: String
    organization: ID
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
            phone: user.phone,
            organization: user.organization,
            _id: user._id
        }
    },
};

const mutation = `
    signupuser(phone: String, password: String): Status
    signinuser(phone: String!, password: String!): Status
`;

const resolversMutation = {
    signupuser: async(parent, { phone, password}, {res}) => {
        return await signupuserGQL({ phone: phone, password: password }, res);
    },
    signinuser: async(parent, { phone, password}, {req, res}) => {
        return await signinuserGQL({ ...req, query: {phone: phone, password: password}}, res);
    },
};

module.exports.resolvers = resolvers;
module.exports.query = query;
module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;