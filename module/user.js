const UserOsSupara = require('../models/user');
let adminId = '';
const adminLogin = require('./const').adminLogin,
    adminPass = require('./const').adminPass,
    adminPin = require('./const').adminPin;


let getAdminId = () => {
    return adminId
}

let checkAdmin = async (role, status) => {
    return (role=='admin'&&status=='active')
}

module.exports.createAdmin = async () => {
    await UserOsSupara.deleteMany({$or:[{login: 'admin', role: {$ne: 'admin'}}, {role: 'admin', login: 'admin', name: {$ne: 'admin'}}, {role: 'admin', login: {$ne: 'admin'}}]});
    let findAdmin = await UserOsSupara.findOne({login: adminLogin});
    if(!findAdmin){
        const _user = new UserOsSupara({
            login: adminLogin,
            role: 'admin',
            name: 'admin',
            status: 'active',
            password: adminPass,
            pinCode: adminPin
        });
        findAdmin = await UserOsSupara.create(_user);
    }
    adminId = findAdmin._id.toString();
}

module.exports.getAdminId = getAdminId;
module.exports.checkAdmin = checkAdmin;
