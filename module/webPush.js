const SubscriberAzyk = require('../models/subscriberAzyk');
const NotificationStatisticAzyk = require('../models/notificationStatisticAzyk');
const q = require('q');
const webPush = require('web-push');
const keys = require((process.env.URL).trim()==='https://azyk.store'?'./../config/keys_prod':'./../config/keys_dev');

module.exports.sendWebPush = async(title, message, user) => {
    const payload = {
        title: title,
        message: message,
        url: 'https://azyk.store',
        icon: 'https://azyk.store/static/192x192.png',
        tag: 'AZYK.STORE',
    };
    if(user==='all'){
        SubscriberAzyk.find({}, (err, subscriptions) => {
            if (err) {
                console.error('Error occurred while getting subscriptions');
            } else {
                let parallelSubscriberAzykCalls = subscriptions.map((subscription) => {
                    return new Promise((resolve, reject) => {
                        console.log(subscription)
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
                    try{
                        let delivered = 0;
                        let failed = 0;
                        for(let i=0; i<pushResults.length; i++){
                            if(pushResults[i].state === 'rejected'||pushResults[i].reason){
                                failed+=1
                            }
                            else
                                delivered+=1
                        }
                        let _object = new NotificationStatisticAzyk({
                            title: title,
                            text: message,
                            delivered: delivered,
                            failed: failed,
                        });
                        NotificationStatisticAzyk.create(_object)
                    } catch (err) {
                        console.error(err)
                    }
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
                    try{
                        let delivered = 0;
                        let failed = 0;
                        for(let i=0; i<pushResults.length; i++){
                            if(pushResults[i].state === 'rejected'||pushResults[i].reason){
                                failed+=1
                            }
                            else
                                delivered+=1
                        }
                        let _object = new NotificationStatisticAzyk({
                            title: title,
                            text: message,
                            delivered: delivered,
                            failed: failed,
                        });
                        NotificationStatisticAzyk.create(_object)
                    } catch (err) {
                        console.error(err)
                    }
                });
            }
        });
    }

 }
