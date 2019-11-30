const UserAzyk = require('../models/userAzyk');
let adminId = '';
const adminLogin = require('./const').adminLogin,
    adminPass = require('./const').adminPass;


let getAdminId = () => {
    return adminId
}

let checkAdmin = async (role, status) => {
    return (role=='admin'&&status=='active')
}

let createAdmin = async () => {
    await UserAzyk.deleteMany({phone: adminLogin});
        let findAdmin = await UserAzyk.findOne({phone: adminLogin});
        console.log(await UserAzyk.find({role: 'admin'}))
        if(!findAdmin){
            const _user = new UserAzyk({
                phone: adminLogin,
                role: 'admin',
                status: 'active',
                password: adminPass,
            });
            findAdmin = await UserAzyk.create(_user);
        }
        adminId = findAdmin._id.toString();
}


module.exports.createAdmin = createAdmin;
module.exports.createAdmin = createAdmin;
module.exports.getAdminId = getAdminId;
module.exports.checkAdmin = checkAdmin;
