const express = require('express');
const router = express.Router();
const randomstring = require('randomstring');
const SubscriberAzyk = require('../models/subscriberAzyk');
const passportEngine = require('../module/passport');

router.post('/register', async (req, res) => {
    await passportEngine.getuser(req, res, async (user)=> {
        let subscriptionModel;
        let number = req.body.number
        if(number){
            subscriptionModel = await SubscriberAzyk.findOne({number: number})
            if(user) subscriptionModel.user = user._id
            subscriptionModel.endpoint = req.body.endpoint
            subscriptionModel.keys = req.body.keys
        }
        else {
            number = randomstring.generate({length: 20, charset: 'numeric'});
            while (await SubscriberAzyk.findOne({number: number}))
                number = randomstring.generate({length: 20, charset: 'numeric'});
            subscriptionModel = new SubscriberAzyk({
                endpoint: req.body.endpoint,
                keys: req.body.keys,
                number: number,
            });
            if(user) subscriptionModel.user = user._id
        }
        subscriptionModel.save((err) => {
            if (err) {
                console.error(`Error occurred while saving subscription. Err: ${err}`);
                res.status(500).json({
                    error: 'Technical error occurred'
                });
            } else {
                console.error('Subscription saved');
                res.send(number)
            }
        });
    })
});

router.post('/unregister', async (req, res) => {
    await SubscriberAzyk.updateMany({number: req.body.number}, {user: null})
});

module.exports = router;