
const randomstring = require('randomstring');
const app = require('../app');
const fs = require('fs');
const path = require('path');

const urlMain = 'http://'+process.env.URL.trim()+':3000',
    adminLogin = 'admin',
    skip = 10,
    adminPass = 'hGNSKtmSBG'
const validMail = (mail) =>
{
    return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(mail);
}
const validPhone = (phone) =>
{
    return /^[+]{1}996[0-9]{9}$/.test(phone);
}

const checkInt = (int) => {
    return isNaN(parseInt(int))?0:parseInt(int)
}

module.exports.saveFile = (stream, filename) => {
    return new Promise((resolve) => {
        filename = `${randomstring.generate(7)}${filename}`;
        let filepath = path.join(app.dirname, 'public', 'images', filename)
        let fstream = fs.createWriteStream(filepath);
        stream.pipe(fstream)
        fstream.on('finish', async () => {
            resolve(`/images/${filename}`)
        })
    })
}

module.exports.deleteFile = (oldFile) => {
    return new Promise((resolve) => {
        oldFile.replace(urlMain, '')
        oldFile = path.join(app.dirname, 'public', oldFile)
        fs.unlink(oldFile, ()=>{
            resolve()
        })
    })
}



module.exports.checkInt = checkInt;
module.exports.skip = skip;
module.exports.validPhone = validPhone;
module.exports.validMail = validMail;
module.exports.adminPass = adminPass;
module.exports.adminLogin = adminLogin;
module.exports.urlMain = urlMain;
