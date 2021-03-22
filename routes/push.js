const express = require('express');
const router = express.Router();
const { sendWebPush } = require('../module/webPush');
const UserOsSupara = require('../models/user');
const ModelsErrorOsSupara = require('../models/error');

router.get('/admin', async (req, res) => {
    try{
        let user = await UserOsSupara.findOne({role: 'admin'})
        if(user){
            sendWebPush({title: 'TEST', message: 'TEST', user: user._id})
            res.json('Push triggered');
        }
        else {
            res.json('Push error');
        }
    } catch (err) {
        let _object = new ModelsErrorOsSupara({
            err: err.message,
            path: err.path
        });
        ModelsErrorOsSupara.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/all', (req, res) => {
    try{
        sendWebPush({title: 'TEST', message: 'TEST', user: 'all'})
        res.json('Push triggered');
    } catch (err) {
        let _object = new ModelsErrorOsSupara({
            err: err.message,
            path: err.path
        });
        ModelsErrorOsSupara.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

module.exports = router;