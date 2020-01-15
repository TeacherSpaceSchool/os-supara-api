const express = require('express');
const router = express.Router();
const SubscriberAzyk = require('../models/subscriberAzyk');
const q = require('q');
const webPush = require('web-push');
const keys = require('./../config/keys_dev');
router.get('/', (req, res) => {
    const payload = {
        title: 'AZYK.STORE',
        message: 'Не забудьте сделать свой заказ',
        url: 'https://azyk.store',
        icon: 'https://azyk.store/static/192x192.png',
        image: undefined,
        badge: undefined,
        tag: undefined
    };

    SubscriberAzyk.find({}, (err, subscriptions) => {
        if (err) {
            console.error('Error occurred while getting subscriptions');
            res.status(500).json({
                error: 'Technical error occurred'
            });
        } else {
            let parallelSubscriberAzykCalls = subscriptions.map((subscription) => {
                return new Promise((resolve, reject) => {
                    const pushSubscriberAzyk = {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.keys.p256dh,
                            auth: subscription.keys.auth
                        }
                    };

                    const pushPayload = JSON.stringify(payload);
                    const pushOptions = {
                        vapidDetails: {
                            subject: 'https://azyk.store',
                            privateKey: keys.privateKey,
                            publicKey: keys.publicKey
                        },
                        TTL: payload.ttl,
                        headers: {}
                    };
                    webPush.sendNotification(
                        pushSubscriberAzyk,
                        pushPayload,
                        pushOptions
                    ).then((value) => {
                        resolve({
                            status: true,
                            endpoint: subscription.endpoint,
                            data: value
                        });
                    }).catch((err) => {
                        reject({
                            status: false,
                            endpoint: subscription.endpoint,
                            data: err
                        });
                    });
                });
            });
            q.allSettled(parallelSubscriberAzykCalls).then((pushResults) => {
                console.info(pushResults);
            });
            res.json({
                data: 'Push triggered'
            });
        }
    });
});
module.exports = router;