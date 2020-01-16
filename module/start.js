const { startCategoryAzyk } = require('../module/categoryAzyk');
const { startSubCategoryAzyk } = require('../module/subCategoryAzyk');
const { reductionToBonus } = require('../module/bonusAzyk');
const { reductionToClient } = require('../module/clientAzyk');
const { startClientRedis } = require('../module/redis');
const { reductionToUser, createAdmin } = require('../module/user');
const subscriberAzyk = require('../models/subscriberAzyk');
const { Worker, isMainThread,  workerData, parentPort } = require('worker_threads');

let startResetBonusesClient = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/resetBonusesClient.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('ResetBonusesClient: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`ResetBonusesClient stopped with exit code ${code}`))
        });
        console.log('ResetBonusesClient '+w.threadId+ ' run')
    }
}

let startReminderClient = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/reminderClient.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('ReminderBonusesClient: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`ReminderBonusesClient stopped with exit code ${code}`))
        });
        console.log('ReminderBonusesClient '+w.threadId+ ' run')
    }
}

let start = async () => {
    //await startClientRedis()
    await startCategoryAzyk()
    await startSubCategoryAzyk()
    await reductionToBonus()
    await reductionToClient()
    await reductionToUser()
    await startResetBonusesClient()
    await startReminderClient();
    await createAdmin();
}

module.exports.start = start;
