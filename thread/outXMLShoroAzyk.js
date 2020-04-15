const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const { reductionOutAdsXMLShoroAzyk } = require('../module/outXMLShoroAzyk');
const cron = require('node-cron');
connectDB.connect()
if(!isMainThread) {
    cron.schedule('35 1 * * *', async() => {
        await reductionOutAdsXMLShoroAzyk()
    });
}