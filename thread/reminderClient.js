const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const {sendWebPush} = require('../module/webPush');
const cron = require('node-cron');
connectDB.connect()
if(!isMainThread) {
    cron.schedule('1-5 10 * * *', async() => {
        sendWebPush('AZYK.STORE', 'Не забудьте сделать свой заказ', 'all')
    });
    /*cron.schedule('1-5 15 * * *', async() => {
        sendWebPush('AZYK.STORE', 'Не забудьте сделать свой заказ', 'all')
    });*/
    cron.schedule('1-5 20 * * *', async() => {
        sendWebPush('AZYK.STORE', 'Не забудьте сделать свой заказ', 'all')
    });
}