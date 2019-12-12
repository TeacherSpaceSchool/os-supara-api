const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const cron = require('node-cron');
const BonusClientAzyk = require('../models/bonusClientAzyk');
connectDB.connect()
if(!isMainThread) {
    cron.schedule('* * 1 * *', async() => {
        await BonusClientAzyk.updateMany({}, {current: 0, added: false});
    });
}