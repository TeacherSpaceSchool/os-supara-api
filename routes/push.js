const express = require('express');
const router = express.Router();
const { sendWebPush } = require('../module/webPush');
const UserAzyk = require('../models/userAzyk');
const SubscriberAzyk = require('../models/subscriberAzyk');
const NotificationStatisticAzyk = require('../models/notificationStatisticAzyk');

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

router.post('/clicknotification', async (req, res) => {
    let ip = JSON.stringify(req.ip)
    let object = await NotificationStatisticAzyk.findOne({_id: req.body.notification})
    if(object&&!object.ips.includes(ip)){
        object.click+=1
        object.ips.push(ip)
        await object.save()
    }
});

module.exports = router;