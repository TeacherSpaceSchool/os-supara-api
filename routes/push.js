const express = require('express');
const router = express.Router();
const { sendWebPush } = require('../module/webPush');
const UserAzyk = require('../models/userAzyk');
const SubscriberAzyk = require('../models/subscriberAzyk');

router.get('/admin', async (req, res) => {
    let user = await UserAzyk.findOne({role: 'admin'})
    if(user){
        sendWebPush({title: 'AZYK.STORE', message: 'Не забудьте сделать свой заказ', user: user._id})
        res.json('Push triggered');
    }
    else {
        res.json('Push error');
    }
});

router.get('/all', (req, res) => {
        sendWebPush({title: 'AZYK.STORE', message: 'Не забудьте сделать свой заказ', user: 'all'})
        res.json('Push triggered');
});
module.exports = router;