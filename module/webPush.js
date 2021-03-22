const SubscriberOsSupara = require('../models/subscriber');
const UserOsSupara = require('../models/user');
const q = require('q');
const webPush = require('web-push');
const keys = require((process.env.URL).trim()==='https://os-supara.xyz'?'./../config/keys_prod':'./../config/keys_dev');

let sendWebPush = async({title, message, tag, url, icon, user}) => {
    const payload = {
        title: title?title:title,
        message: message?message:message,
        url: url?url:'https://os-supara.xyz',
        icon: icon?icon:'https://os-supara.xyz/static/192x192.png',
        tag: tag?tag:'os-supara.xyz'
    };
    if(user==='all'){
        SubscriberOsSupara.find({}, (err, subscriptions) => {
            if (err) {
                console.error('Error occurred while getting subscriptions');
            } else {
                let parallelSubscriberOsSuparaCalls = subscriptions.map((subscription) => {
                    return new Promise((resolve, reject) => {
                        const pushSubscriberOsSupara = {
                            endpoint: subscription.endpoint,
                            keys: {
                                p256dh: subscription.keys.p256dh,
                                auth: subscription.keys.auth
                            }
                        };

                        const pushPayload = JSON.stringify(payload);
                        const pushOptions = {
                            vapidDetails: {
                                subject: 'https://OsSupara.store',
                                privateKey: keys.privateKey,
                                publicKey: keys.publicKey
                            },
                            headers: {}
                        };
                        webPush.sendNotification(
                            pushSubscriberOsSupara,
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
                q.allSettled(parallelSubscriberOsSuparaCalls).then(async(pushResults) => {
                    //console.log(pushResults)
                });
            }
        });
    }
    else {
        SubscriberOsSupara.find({user: user}, (err, subscriptions) => {
            if (err) {
                console.error('Error occurred while getting subscriptions');
            } else {
                let parallelSubscriberOsSuparaCalls = subscriptions.map((subscription) => {
                    return new Promise((resolve, reject) => {
                        const pushSubscriberOsSupara = {
                            endpoint: subscription.endpoint,
                            keys: {
                                p256dh: subscription.keys.p256dh,
                                auth: subscription.keys.auth
                            }
                        };

                        const pushPayload = JSON.stringify(payload);
                        const pushOptions = {
                            vapidDetails: {
                                subject: 'https://OsSupara.store',
                                privateKey: keys.privateKey,
                                publicKey: keys.publicKey
                            },
                            headers: {}
                        };
                        webPush.sendNotification(
                            pushSubscriberOsSupara,
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
                q.allSettled(parallelSubscriberOsSuparaCalls).then(async (pushResults) => {
                    //console.log(pushResults)
                });
            }
        });
    }

}


let sendWebPushByRolesIds = async ({title, message, url, roles, _ids})=>{
    for(let i = 0; i<roles.length; i++){
        let users
        users = await UserOsSupara.find({role: roles[i]}).distinct('_id').lean()
        for(let i1 = 0; i1<users.length; i1++) {
            await sendWebPush({title, message, url, user: users[i1]})
        }
    }
    for(let i = 0; i<_ids.length; i++) {
        await sendWebPush({title, message, url, user: _ids[i]})
    }

}

module.exports.sendWebPush = sendWebPush
module.exports.sendWebPushByRolesIds = sendWebPushByRolesIds