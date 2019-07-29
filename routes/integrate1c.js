var express = require('express');
var router = express.Router();
const PointShoro = require('../models/pointShoro');
const RegionShoro = require('../models/regionShoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const RealizatorShoro = require('../models/realizatorShoro');
const UserShoro = require('../models/userShoro');

/* GET home page. */
router.post('/put', async (req, res, next) => {
    if(req.body.elements[0].attributes.mode==='manager'){
        for(let i = 0; i<req.body.elements[0].elements.length; i++) {
            //guid   req.body.elements[0].elements[i].attributes.guid
            //del   req.body.elements[0].elements[i].attributes.del
            //name   req.body.elements[0].elements[i].elements[0].text
            if(req.body.elements[0].elements[i].attributes.del!=='1') {
                let find = await OrganizatorShoro.findOne({guid: req.body.elements[0].elements[i].attributes.guid});
                if (find == null) {
                    let _user = new UserShoro({
                        email: '',
                        role: 'организатор',
                        status: 'active',
                        password: '12345678',
                    });
                    let _object = new OrganizatorShoro({
                        name: req.body.elements[0].elements[i].elements[0].text,
                        phone: '',
                        region: 'Резерв',
                        user: _user._id,
                        guidRegion: 'lol',
                        guid: req.body.elements[0].elements[i].attributes.guid
                    });
                    _user.email = _object._id
                    _object.phone = _object._id
                    await UserShoro.create(_user);
                    await OrganizatorShoro.create(_object);
                }
                else if (find.name !== req.body.elements[0].elements[i].elements[0].text) {
                    await OrganizatorShoro.updateMany({guid: req.body.elements[0].elements[i].attributes.guid}, {$set: {name: req.body.elements[0].elements[i].elements[0].text}});
                }
            } else {
                let object = await OrganizatorShoro.findOne({guid: req.body.elements[0].elements[i].attributes.guid})
                if(object!==null){
                    await UserShoro.deleteMany({_id: {$in: object.user}});
                    await OrganizatorShoro.deleteMany({guid: req.body.elements[0].elements[i].attributes.guid});
                }
            }
        }
    } else if(req.body.elements[0].attributes.mode==='place'){
        for(let i = 0; i<req.body.elements[0].elements.length; i++){
            if(req.body.elements[0].elements[i].attributes.del!=='1') {
                let find = await RegionShoro.findOne({guid: req.body.elements[0].elements[i].attributes.guid});
                if (find == null) {
                    find = new RegionShoro({
                        name: ((req.body.elements[0].elements[i].elements[0].text).replace('\r\n', '')).trim(),
                        guid: req.body.elements[0].elements[i].attributes.guid
                    });
                    await RegionShoro.create(find);
                    find = new PointShoro({
                        name: 'Резерв',
                        guid: 'lol',
                        region: ((req.body.elements[0].elements[i].elements[0].text).replace('\r\n', '')).trim(),
                        guidRegion: req.body.elements[0].elements[i].attributes.guid
                    });
                    await PointShoro.create(find);
                }
                else if (find.name !== ((req.body.elements[0].elements[i].elements[0].text).replace('\r\n', '')).trim()) {
                    await RegionShoro.updateMany({guid: req.body.elements[0].elements[i].attributes.guid}, {$set: {name: ((req.body.elements[0].elements[i].elements[0].text).replace('\r\n', '')).trim()}});
                    await PointShoro.updateMany({guidRegion: req.body.elements[0].elements[i].attributes.guid}, {$set: {region: ((req.body.elements[0].elements[i].elements[0].text).replace('\r\n', '')).trim()}});
                    await OrganizatorShoro.updateMany({guidRegion: req.body.elements[0].elements[i].attributes.guid}, {$set: {region: ((req.body.elements[0].elements[i].elements[0].text).replace('\r\n', '')).trim()}});
                    await RealizatorShoro.updateMany({guidRegion: req.body.elements[0].elements[i].attributes.guid}, {$set: {region: ((req.body.elements[0].elements[i].elements[0].text).replace('\r\n', '')).trim()}});
                }
                for (let i1 = 1; i1 < req.body.elements[0].elements[i].elements.length; i1++) {
                    if(req.body.elements[0].elements[i].elements[i1].attributes.del!=='1') {
                        let find = await PointShoro.findOne({guid: req.body.elements[0].elements[i].elements[i1].attributes.guid});
                        if (find == null) {
                            find = new PointShoro({
                                name: ((req.body.elements[0].elements[i].elements[i1].elements[0].text).replace('\r\n', '')).trim(),
                                guid: req.body.elements[0].elements[i].elements[i1].attributes.guid,
                                region: ((req.body.elements[0].elements[i].elements[0].text).replace('\r\n', '')).trim(),
                                guidRegion: req.body.elements[0].elements[i].attributes.guid
                            });
                            await PointShoro.create(find);
                        } else if (find.name !== ((req.body.elements[0].elements[i].elements[0].text).replace('\r\n', '')).trim()) {
                            await PointShoro.updateMany({guid: req.body.elements[0].elements[i].elements[i1].attributes.guid}, {$set: {name: ((req.body.elements[0].elements[i].elements[i1].elements[0].text).replace('\r\n', '')).trim()}});
                            await RealizatorShoro.updateMany({guidPoint: req.body.elements[0].elements[i].elements[i1].attributes.guid}, {$set: {point: ((req.body.elements[0].elements[i].elements[i1].elements[0].text).replace('\r\n', '')).trim()}});
                        }
                    } else {
                        await PointShoro.deleteMany({guid: req.body.elements[0].elements[i].elements[i1].attributes.guid})
                        await RealizatorShoro.updateMany({guidPoint: req.body.elements[0].elements[i].elements[i1].attributes.guid}, {$set: {point: 'Резерв',guidPoint: 'lol'}});
                    }
                }
            }
            else {
                await RegionShoro.deleteMany({guid: req.body.elements[0].elements[i].attributes.guid})
                await PointShoro.deleteMany({guidRegion: req.body.elements[0].elements[i].attributes.guid})
                await OrganizatorShoro.updateMany({guidRegion: req.body.elements[0].elements[i].attributes.guid}, {$set: {region: 'Резерв', guidRegion: 'lol'}});
                await RealizatorShoro.updateMany({guidRegion: req.body.elements[0].elements[i].attributes.guid}, {$set: {region: 'Резерв', guidRegion: 'lol', point: 'Резерв',guidPoint: 'lol'}});
            }
        }
    } else if(req.body.elements[0].attributes.mode==='seller'){
        for(let i = 0; i<req.body.elements[0].elements.length; i++) {
            //guid   req.body.elements[0].elements[i].attributes.guid
            //del   req.body.elements[0].elements[i].attributes.del
            //name   req.body.elements[0].elements[i].elements[0].text
            if(req.body.elements[0].elements[i].attributes.del!=='1') {
                let find = await RealizatorShoro.findOne({guid: req.body.elements[0].elements[i].attributes.guid});
                if (find == null) {
                    let _user = new UserShoro({
                        email: '',
                        role: 'реализатор',
                        status: 'active',
                        password: '12345678',
                    });
                    let _object = new RealizatorShoro({
                        name: req.body.elements[0].elements[i].elements[0].text,
                        phone: '',
                        region: 'Резерв',
                        point: 'Резерв',
                        user: _user._id,
                        guidRegion: 'lol',
                        guidPoint: 'lol',
                        guid: req.body.elements[0].elements[i].attributes.guid
                    });
                    _user.email = _object._id
                    _object.phone = _object._id
                    await UserShoro.create(_user);
                    await RealizatorShoro.create(_object);
                }
                else if (find.name !== req.body.elements[0].elements[i].elements[0].text) {
                    await RealizatorShoro.updateMany({guid: req.body.elements[0].elements[i].attributes.guid}, {$set: {name: req.body.elements[0].elements[i].elements[0].text}});
                }
            } else {
                let object = await RealizatorShoro.findOne({guid: req.body.elements[0].elements[i].attributes.guid})
                if(object!==null){
                    await UserShoro.deleteMany({_id: {$in: object.user}});
                    await RealizatorShoro.deleteMany({guid: req.body.elements[0].elements[i].attributes.guid});
                }
            }
        }
    }
    await res.send('lol')
});

module.exports = router;
