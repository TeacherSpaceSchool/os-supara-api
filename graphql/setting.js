const SettingOsSupara = require('../models/setting');
const ApplicationOsSupara = require('../models/application');
const BalanceOsSupara = require('../models/balance');
const Balance1COsSupara = require('../models/balance1C');
const BalanceHistoryOsSupara = require('../models/balanceHistory');
const Balance1CHistoryOsSupara = require('../models/balance1CHistory');
const CashConsumableOsSupara = require('../models/cashConsumable');
const CategoryOsSupara = require('../models/category');
const DivisionOsSupara = require('../models/division');
const ExpenseReportOsSupara = require('../models/expenseReport');
const FaqOsSupara = require('../models/faq');
const ItemReportOsSupara = require('../models/item');
const RoleOsSupara = require('../models/role');
const RouteOsSupara = require('../models/route');
const SellerOsSupara = require('../models/seller');
const SubdivisionOsSupara = require('../models/subdivision');
const SubscriberOsSupara = require('../models/subscriber');
const UnitOsSupara = require('../models/unit');
const UserOsSupara = require('../models/user');
const WaybillOsSupara = require('../models/waybill');
const MemorandumOsSupara = require('../models/memorandum');
const AutoApplicationOsSupara = require('../models/autoApplication');
const CashExchange = require('../models/cashExchange');
const StorageOsSupara = require('../models/storage');
const StorageHistoryOsSupara = require('../models/storageHistory');

const type = `
  type Setting {
    _id: ID
    createdAt: Date
    lang: String
  }
`;

const query = `
    setting: Setting
`;

const mutation = `
    setSetting(lang: String): Data
    clearStorage: Data
`;

const resolvers = {
    setting: async(parent, ctx, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)&&user.checkedPinCode) {
            return await SettingOsSupara.findOne().lean()
        }
    }
};

const resolversMutation = {
    setSetting: async(parent, {lang}, {user}) => {
        if(['admin', 'менеджер'].includes(user.role)&&user.checkedPinCode) {
            let object = await SettingOsSupara.findOne()
            if (lang) object.lang = lang
            await object.save();
        }
        return {data: 'OK'}
    },
    clearStorage: async(parent, ctx, {user}) => {
        if('admin'===user.role&&user.checkedPinCode) {
            await ApplicationOsSupara.deleteMany();
            await BalanceOsSupara.deleteMany();
            await Balance1COsSupara.deleteMany();
            await BalanceHistoryOsSupara.deleteMany();
            await Balance1CHistoryOsSupara.deleteMany();
            await CashConsumableOsSupara.deleteMany();
            await CategoryOsSupara.deleteMany();
            await DivisionOsSupara.deleteMany();
            await ExpenseReportOsSupara.deleteMany();
            await FaqOsSupara.deleteMany();
            await ItemReportOsSupara.deleteMany();
            await RoleOsSupara.deleteMany();
            await RouteOsSupara.deleteMany();
            await SellerOsSupara.deleteMany();
            await SubdivisionOsSupara.deleteMany();
            await SubscriberOsSupara.deleteMany();
            await UnitOsSupara.deleteMany();
            await UserOsSupara.deleteMany({role: {$ne: 'admin'}});
            await WaybillOsSupara.deleteMany();
            await MemorandumOsSupara.deleteMany();
            await AutoApplicationOsSupara.deleteMany();
            await StorageOsSupara.deleteMany();
            await StorageHistoryOsSupara.deleteMany();
            await CashExchange.deleteMany();
        }
        return {data: 'OK'}
    },
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;