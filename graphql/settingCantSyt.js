const SettingCantSyt = require('../models/settingCantSyt');

const type = `
  type Setting {
    _id: ID
    createdAt: Date
    supplier: String
  }
`;

const query = `
    setting: Setting
`;

const mutation = `
    setSetting(supplier: String ): Data
`;

const resolvers = {
    setting: async(parent, ctx, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)) {
            return await SettingCantSyt.findOne().lean()
        }
    }
};

const resolversMutation = {
    setSetting: async(parent, {supplier}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)) {
            let object = await SettingCantSyt.findOne()
            if (supplier) object.supplier = supplier
            await object.save();
        }
        return {data: 'OK'}
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;