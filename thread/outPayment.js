const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
connectDB.connect()
let semapfore = true
if(!isMainThread) {
    setInterval(async()=>{
            if(semapfore) {
                semapfore = false
                //ToDo
                semapfore = true
            }
        }
    ,5*60*1000)
}