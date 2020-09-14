const BalanceCantSyt = require('../models/balanceCantSyt');
const UserCantSyt = require('../models/userCantSyt');

const type = `
  type Balance {
    _id: ID
    createdAt: Date
    amount: [Currency]
    supplier: User
  }
`;

const query = `
    balances(search: String!, skip: Int!): [Balance]
    myBalance: Balance
`;

const resolvers = {
    myBalance: async(parent, ctx, {user}) => {
        if('снабженец'===user.role){
            return await BalanceCantSyt.findOne({
                supplier: user._id
            })
                .populate('supplier')
                .lean()
        }
    },
    balances: async(parent, {search, skip}, {user}) => {
        let users
        if(search.length){
            users = await UserCantSyt.find({name: {'$regex': search, '$options': 'i'}}).distinct('_id').lean()
        }
        let balances
        if(['admin', 'менеджер'].includes(user.role)){
            balances = await BalanceCantSyt.find({
                ...search.length?{supplier: {$in: users}}:{}
            })
                .populate('supplier')
                .skip(skip!=undefined?skip:0)
                .limit(skip!=undefined?15:10000000000)
                .lean()
        }
        else if(['снабженец'].includes(user.role)){
            balances = await BalanceCantSyt.find({
                supplier: user._id
            })
                .populate('supplier')
                .lean()
        }
        return balances
    },
};
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;
module.exports.changeBalance = async({supplier, currencyType, addAmount, removeAmount})=>{
    let balance = await BalanceCantSyt.findOne({supplier: supplier})
    let index
    if(!balance) {
        balance = new BalanceCantSyt({
            amount: [],
            supplier: supplier
        });
        balance = await BalanceCantSyt.create(balance);
    }
    for(let i=0; i<balance.amount.length; i++){
        if(balance.amount[i].name===currencyType)
            index = i
    }
    if(index==undefined){
        balance.amount.push({name: currencyType, value: 0})
        index = balance.amount.length-1
    }
    balance.amount[index].value -= removeAmount
    balance.amount[index].value += addAmount
    await balance.save()
}