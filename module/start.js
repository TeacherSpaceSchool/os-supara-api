const { createAdmin } = require('../module/user');
const { createCategoryOther } = require('../module/categoryCantSyt');
const { createSetting } = require('../module/settingCantSyt');
const { Worker, isMainThread } = require('worker_threads');

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

let start = async () => {
    await startResetUnloading();
    await createCategoryOther();
    await createAdmin();
    await createSetting();
}

module.exports.start = start;
