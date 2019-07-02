const UserShoro = require('../models/userShoro');
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
        let findAdmin = await UserShoro.findOne({email: adminLogin});
        if(findAdmin==null){
            const _user = new UserShoro({
                email: adminLogin,
                role: 'admin',
                status: 'active',
                password: adminPass,
            });
            findAdmin = await UserShoro.create(_user);
        }
        adminId = findAdmin._id.toString();
}


module.exports.createAdmin = createAdmin;
module.exports.createAdmin = createAdmin;
module.exports.getAdminId = getAdminId;
module.exports.checkAdmin = checkAdmin;
