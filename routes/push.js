const express = require('express');
const router = express.Router();
const { sendWebPush } = require('../module/webPush');
const UserCantSyt = require('../models/userCantSyt');
const ModelsErrorCantSyt = require('../models/errorCantSyt');

router.get('/admin', async (req, res) => {
    try{
        let user = await UserCantSyt.findOne({role: 'admin'})
        if(user){
            sendWebPush({title: 'TEST', message: 'TEST', user: user._id})
            res.json('Push triggered');
        }
        else {
            res.json('Push error');
        }
    } catch (err) {
        let _object = new ModelsErrorCantSyt({
            err: err.message,
            path: err.path
        });
        ModelsErrorCantSyt.create(_object)
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
        let _object = new ModelsErrorCantSyt({
            err: err.message,
            path: err.path
        });
        ModelsErrorCantSyt.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

module.exports = router;