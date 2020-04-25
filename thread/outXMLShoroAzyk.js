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
                data: err.message,
            });
            ModelsErrorAzyk.create(_object)
            console.error(err)
        }
    });
}