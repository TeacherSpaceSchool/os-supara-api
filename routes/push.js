const express = require('express');
const router = express.Router();
const { getAdminId } = require('../module/user');
const { sendWebPush } = require('../module/webPush');

router.get('/admin', (req, res) => {
    console.log(getAdminId())
    if(getAdminId()){
        sendWebPush('AZYK.STORE', 'Не забудьте сделать свой заказ', getAdminId())
        res.json('Push triggered');
    }
    else {
        res.json('Push error');
    }
});

router.get('/all', (req, res) => {
        sendWebPush('AZYK.STORE', 'Не забудьте сделать свой заказ', 'all')
        res.json('Push triggered');
});
module.exports = router;