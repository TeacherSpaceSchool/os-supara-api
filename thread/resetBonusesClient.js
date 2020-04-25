const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const cron = require('node-cron');
const BonusClientAzyk = require('../models/bonusClientAzyk');
const ModelsErrorAzyk = require('../models/errorAzyk');
connectDB.connect()
if(!isMainThread) {
    cron.schedule('* * 1 * *', async() => {
        try{
            await BonusClientAzyk.updateMany({}, {current: 0, added: false});
        } catch (err) {
            let _object = new ModelsErrorAzyk({
                err: err.message,
                path: err.path
            });
            ModelsErrorAzyk.create(_object)
            console.error(err)
        }
    });
}