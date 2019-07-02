const url = '/',
    adminLogin = 'admin',
    adminPass = 'pE48hS',
    month = {
        '01':'янв',
        '02':'фев',
        '03':'мар',
        '04':'апр',
        '05':'май',
        '06':'июн',
        '07':'июл',
        '08':'авг',
        '09':'сен',
        '10':'окт',
        '11':'ноя',
        '12':'дек'
    },
    monthWithDay = {
        'январь': 31,
        'февраль': 28,
        'март': 31,
        'апрель': 30,
        'май': 31,
        'июнь': 30,
        'июль': 31,
        'август': 31,
        'сентябрь': 30,
        'октябрь': 31,
        'ноябрь': 30,
        'декабрь': 31
    },
    previousMonth = {
        'январь': 'декабрь',
        'февраль': 'январь',
        'март': 'февраль',
        'апрель': 'март',
        'май': 'апрель',
        'июнь': 'май',
        'июль': 'июнь',
        'август': 'июль',
        'сентябрь': 'август',
        'октябрь': 'сентябрь',
        'ноябрь': 'октябрь',
        'декабрь': 'ноябрь'
    },
    nextMonth = {
        'январь': 'февраль',
        'февраль': 'март',
        'март': 'апрель',
        'апрель': 'май',
        'май': 'июнь',
        'июнь': 'июль',
        'июль': 'август',
        'август': 'сентябрь',
        'сентябрь': 'октябрь',
        'октябрь': 'ноябрь',
        'ноябрь': 'декабрь',
        'декабрь': 'январь'
    },
    skip = 10,
    month1 = [
        'январь',
        'февраль',
        'март',
        'апрель',
        'май',
        'июнь',
        'июль',
        'август',
        'сентябрь',
        'октябрь',
        'ноябрь',
        'декабрь'
    ]
const stringifyDateTime = (dateTime) => {
    dateTime = new Date(dateTime)
    dateTime.setHours(dateTime.getHours() + 6);
    dateTime = JSON.stringify(dateTime)
    let date = dateTime.split('T')[0].split('-')
    let time = dateTime.split('T')[1].split(':')
    dateTime = date[2]+'.'+date[1]+'.'+date[0]+' '+time[0]+':'+time[1];
    dateTime = dateTime.replace('"', '');
    return dateTime
}
const validMail = (mail) =>
{
    return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(mail);
}
const validPhone = (phone) =>
{
    return /^[+]{1}996[0-9]{9}$/.test(phone);
}
const getYesterday = (day) =>
{
    day = day.split(' ')
    day[0] -= 1
    if(day[0]===0){
        day[0] = monthWithDay[day[1]]
        day[1] = previousMonth[day[1]]
        if(day[1]==='декабрь'){
            day[2] -= 1
        }
    }
    return day[0]+' '+day[1]+' '+day[2]
}
const getToday = () =>
{
    let date = new Date()
    date = JSON.stringify(date).split('-')
    date = date[2].split('T')[0]+' '+month1[parseInt(date[1])-1]+' '+date[0].replace('"', '')
    return date
}
const getTomorrow = (day) =>
{
    day = day.split(' ')
    day[0] = 1 + parseInt(day[0])
    if(day[0]>monthWithDay[day[1]]){
        day[0] = 1
        day[1] = nextMonth[day[1]]
        if(day[1]==='январь'){
            day[2] = parseInt(day[2]) + 1
        }
    }
    return day[0]+' '+day[1]+' '+day[2]
}

const checkInt = (int) => {
    return int===''||int===undefined?0:int
}

const checkMonth= (date1) => {
    let date = new Date(date1)
    date = JSON.stringify(date).split('-')
    date = month1[parseInt(date[1])-1]+' '+date[0].replace('"', '')
    return date
}

module.exports.getToday = getToday;
module.exports.checkMonth = checkMonth;
module.exports.checkInt = checkInt;
module.exports.skip = skip;
module.exports.stringifyDateTime = stringifyDateTime;
module.exports.validPhone = validPhone;
module.exports.validMail = validMail;
module.exports.month = month;
module.exports.adminPass = adminPass;
module.exports.adminLogin = adminLogin;
module.exports.url = url;
module.exports.getYesterday = getYesterday;
module.exports.getTomorrow = getTomorrow;
module.exports.monthWithDay = monthWithDay;
