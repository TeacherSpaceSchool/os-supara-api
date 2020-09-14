const express = require('express');
const router = express.Router();
const randomstring = require('randomstring');
const SubscriberCantSyt = require('../models/subscriberCantSyt');
const passportEngine = require('../module/passport');
const ModelsErrorCantSyt = require('../models/errorCantSyt');

router.post('/register', async (req, res) => {
    await passportEngine.getuser(req, res, async (user)=> {
        try {
            let subscriptionModel;
            let number = req.body.number
            subscriptionModel = await SubscriberCantSyt.findOne({$or: [{number: number}, {endpoint: req.body.endpoint}]})
            if (subscriptionModel) {
                if (user) subscriptionModel.user = user._id
                subscriptionModel.endpoint = req.body.endpoint
                subscriptionModel.keys = req.body.keys
            }
            else {
                number = randomstring.generate({length: 20, charset: 'numeric'});
                while (await SubscriberCantSyt.findOne({number: number}))
                    number = randomstring.generate({length: 20, charset: 'numeric'});
                subscriptionModel = new SubscriberCantSyt({
                    endpoint: req.body.endpoint,
                    keys: req.body.keys,
                    number: number,
                });
                if (user) subscriptionModel.user = user._id
            }
            subscriptionModel.save((err) => {
                if (err) {
                    console.error(`Error occurred while saving subscription. Err: ${err}`);
                    res.status(500).json({
                        error: 'Technical error occurred'
                    });
                } else {
                    console.log('Subscription saved');
                    res.send(subscriptionModel.number)
                }
            });
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
    })
});

router.post('/unregister', async (req, res) => {
    try{
        let subscriptionModel = await SubscriberCantSyt.findOne({number: req.body.number}).populate({ path: 'user'})
        subscriptionModel.user = null
        subscriptionModel.save()
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

router.post('/delete', async (req, res) => {
    try{
        await SubscriberCantSyt.deleteMany({number: req.body.number})
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