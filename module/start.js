const { startCategoryAzyk } = require('../module/categoryAzyk');
const { startSubCategoryAzyk } = require('../module/subCategoryAzyk');
const { reductionToBonus } = require('../module/bonusAzyk');
const { reductionToAgentRoute } = require('../module/agentRouteAzyk');
const { reductionToClient } = require('../module/clientAzyk');
const { reductionInvoices } = require('../module/invoiceAzyk');
const { startClientRedis } = require('../module/redis');
const { reductionToUser, createAdmin } = require('../module/user');
const subscriberAzyk = require('../models/subscriberAzyk');
const { reductionOutXMLShoroAzyk } = require('../module/outXMLShoroAzyk');
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

let startResetUnloading = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/resetUnloading.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('ResetUnloading: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`ResetUnloading stopped with exit code ${code}`))
        });
        console.log('ResetUnloading '+w.threadId+ ' run')
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
    await reductionInvoices()
    await startCategoryAzyk()
    await startResetUnloading()
    await startSubCategoryAzyk()
    await reductionToBonus()
    await reductionToClient()
    await reductionToUser()
    await startResetBonusesClient()
    await startReminderClient();
    await reductionToAgentRoute();
    await createAdmin();
    await reductionOutXMLShoroAzyk()
}

module.exports.start = start;
