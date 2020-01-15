const SubscriberAzyk = require('../models/subscriberAzyk');
const q = require('q');
const webPush = require('web-push');
const keys = require((process.env.URL).trim()==='https://azyk.store'?'./../config/keys_prod':'./../config/keys_dev');

module.exports.sendWebPush = async(title, message, user) => {
    const payload = {
        title: title,
        message: message,
        url: 'https://azyl.store',
        ttl: '36000',
        icon: 'https://azyk.store/static/192x192.png',
        image: undefined,
        badge: undefined,
        tag: undefined
    };
    if(user==='all'){
        SubscriberAzyk.find({}, (err, subscriptions) => {
            if (err) {
                console.error('Error occurred while getting subscriptions');
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
            }
        });
    }
    else {
        SubscriberAzyk.find({user: user}, (err, subscriptions) => {
            if (err) {
                console.error('Error occurred while getting subscriptions');
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
            }
        });
    }

 }
