const express = require('express');
const router = express.Router();
const randomstring = require('randomstring');
const SubscriberAzyk = require('../models/subscriberAzyk');
const ClientAzyk = require('../models/clientAzyk');
const passportEngine = require('../module/passport');

router.post('/register', async (req, res) => {
    await passportEngine.getuser(req, res, async (user)=> {
        let subscriptionModel;
        let number = req.body.number
        subscriptionModel = await SubscriberAzyk.findOne({$or: [{number: number}, {endpoint: req.body.endpoint}]})

        if(subscriptionModel){
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
        if(user.role==='client'){
            let client = await ClientAzyk.findOne({user: user._id})
            client.notification = true
            client.save()
        }
        subscriptionModel.save((err) => {
            if (err) {
                console.error(`Error occurred while saving subscription. Err: ${err}`);
                res.status(500).json({
                    error: 'Technical error occurred'
                });
            } else {
                console.error('Subscription saved');
                res.send(subscriptionModel.number)
            }
        });
    })
});

router.post('/unregister', async (req, res) => {
    let subscriptionModel = await SubscriberAzyk.findOne({number: req.body.number}).populate({ path: 'user'})
    if(subscriptionModel.user&&subscriptionModel.user.role==='client'&&(await SubscriberAzyk.find({user: subscriptionModel.user._id})).length===1){
        let client = await ClientAzyk.findOne({user: subscriptionModel.user._id})
        client.notification = false
        client.save()
    }
    subscriptionModel.user = null
    subscriptionModel.save()
});

router.post('/delete', async (req, res) => {
    let subscriptionModel = await SubscriberAzyk.findOne({number: req.body.number}).populate({ path: 'user'})
    if(subscriptionModel.user&&subscriptionModel.user.role==='client'&&(await SubscriberAzyk.find({user: subscriptionModel.user._id})).length===1){
        let client = await ClientAzyk.findOne({user: subscriptionModel.user._id})
        client.notification = false
        client.save()
    }
    await SubscriberAzyk.deleteMany({number: req.body.number})
});

module.exports = router;