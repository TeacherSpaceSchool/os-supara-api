const { startCategoryAzyk } = require('../module/categoryAzyk');
const { startSubCategoryAzyk } = require('../module/subCategoryAzyk');
const { reductionToBonus } = require('../module/bonusAzyk');
const { reductionToClient } = require('../module/clientAzyk');
const { reductionToUser } = require('../module/user');
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

let start = async () => {
    await startCategoryAzyk()
    await startSubCategoryAzyk()
    await reductionToBonus()
    await reductionToClient()
    await reductionToUser()
    await startResetBonusesClient()
}

module.exports.start = start;
