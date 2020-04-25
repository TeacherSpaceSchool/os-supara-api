const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const { reductionOutAdsXMLShoroAzyk } = require('../module/outXMLShoroAzyk');
const cron = require('node-cron');
const ModelsErrorAzyk = require('../models/errorAzyk');
connectDB.connect()
if(!isMainThread) {
    cron.schedule('1 3 * * *', async() => {
        try{
            await reductionOutAdsXMLShoroAzyk()
        } catch (err) {
            let _object = new ModelsErrorAzyk({
                data: `Err: ${err.message}${err.path?` Path: ${err.path}`:''}`,
            });
            ModelsErrorAzyk.create(_object)
            console.error(err)
        }
    });
}