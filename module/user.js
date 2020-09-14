const UserCantSyt = require('../models/userCantSyt');
let adminId = '';
const adminLogin = require('./const').adminLogin,
    adminPass = require('./const').adminPass;


let getAdminId = () => {
    return adminId
}

let checkAdmin = async (role, status) => {
    return (role=='admin'&&status=='active')
}

module.exports.createAdmin = async () => {
    await UserCantSyt.deleteMany({$or:[{login: 'admin', role: {$ne: 'admin'}}, {role: 'admin', login: {$ne: 'admin'}}]});
    let findAdmin = await UserCantSyt.findOne({login: adminLogin});
    if(!findAdmin){
        const _user = new UserCantSyt({
            login: adminLogin,
            role: 'admin',
            status: 'active',
            password: adminPass,
        });
        findAdmin = await UserCantSyt.create(_user);
    }
    adminId = findAdmin._id.toString();
}

module.exports.getAdminId = getAdminId;
module.exports.checkAdmin = checkAdmin;
