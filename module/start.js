const RegionShoro = require('../models/regionShoro');
const PointShoro = require('../models/pointShoro');
const OrganizatorShoro = require('../models/organizatorShoro');
const RealizatorShoro = require('../models/realizatorShoro');
const UserShoro = require('../models/userShoro');
const BlogShoro = require('../models/blogShoro');
const CarShoro = require('../models/carShoro');
const FaqShoro = require('../models/faqShoro');
const NakladnayaNaPustuyTaruShoro = require('../models/nakladnayaNaPustuyTaruShoro');
const NakladnayaNaVecherniyVozvratShoro = require('../models/nakladnayaNaVecherniyVozvratShoro');
const NakladnayaSklad1Shoro = require('../models/nakladnayaSklad1Shoro');
const NakladnayaSklad2Shoro = require('../models/nakladnayaSklad2Shoro');
const OtchetOrganizatoraShoro = require('../models/otchetOrganizatoraShoro');
const OtchetRealizatoraShoro = require('../models/otchetRealizatoraShoro');
const PlanShoro = require('../models/planShoro');
const PriceShoro = require('../models/priceShoro');
const ZavSkladShoro = require('../models/zavSkladShoro');
const path = require('path');
const fs = require('fs');
const app = require('../app');

let deleteAll = async () => {
    try{
        await PointShoro.deleteMany()
        await OrganizatorShoro.deleteMany()
        await RegionShoro.deleteMany()
        await RealizatorShoro.deleteMany()
        await UserShoro.deleteMany()
        await BlogShoro.deleteMany()
        await CarShoro.deleteMany()
        await FaqShoro.deleteMany()
        await NakladnayaNaPustuyTaruShoro.deleteMany()
        await NakladnayaNaVecherniyVozvratShoro.deleteMany()
        await NakladnayaSklad1Shoro.deleteMany()
        await NakladnayaSklad2Shoro.deleteMany()
        await OtchetOrganizatoraShoro.deleteMany()
        await OtchetRealizatoraShoro.deleteMany()
        await PlanShoro.deleteMany()
        await PriceShoro.deleteMany()
        await ZavSkladShoro.deleteMany()
    } catch(error) {
        console.error(error)
    }
}

let addRealizator = async () => {
    try{
        fs.readFile(path.join(app.dirname, 'realizators.txt'), 'utf8', async (err, contents) => {
            const realizators = contents.split('\n')
            for(let i=0; i<realizators.length; i++){
                realizators[i] = realizators[i].replace('\r', '')
                realizators[i] = realizators[i].split(':')
                let find = await UserShoro.findOne({email: realizators[i][3]});
                if(find==null){
                    let _user = new UserShoro({
                        email: realizators[i][3],
                        role: 'реализатор',
                        status: 'active',
                        password: realizators[i][4],
                    });
                    const user = await UserShoro.create(_user);
                    let _object = new RealizatorShoro({
                        name: realizators[i][2],
                        phone: realizators[i][3],
                        point: realizators[i][1],
                        region: realizators[i][0],
                        user: user._id
                    });
                    await RealizatorShoro.create(_object);
                }
            }


        });
    } catch(error) {
        console.error(error)
    }
}

let addOrganizator = async () => {
    try{
        fs.readFile(path.join(app.dirname, 'organizators.txt'), 'utf8', async (err, contents) => {
            const organizators = contents.split('\n')
            for(let i=0; i<organizators.length; i++){
                organizators[i] = organizators[i].replace('\r', '')
                organizators[i] = organizators[i].split(':')
                let find = await UserShoro.findOne({email: organizators[i][2]});
                if(find==null){
                    let _user = new UserShoro({
                        email: organizators[i][2],
                        role: 'организатор',
                        status: 'active',
                        password: organizators[i][3],
                    });
                    const user = await UserShoro.create(_user);
                    let _object = new OrganizatorShoro({
                        name: organizators[i][1],
                        phone: organizators[i][2],
                        region: organizators[i][0],
                        user: user._id
                    });
                    await OrganizatorShoro.create(_object);
                }
            }
        });
    } catch(error) {
        console.error(error)
    }
}

let addRegion = async () => {
    try{
        fs.readFile(path.join(app.dirname, 'regions.txt'), 'utf8', async (err, contents) => {
            const regions = contents.split('\n')
            for(let i=0; i<regions.length; i++){
                regions[i] = regions[i].replace('\r', '')
                let find = await RegionShoro.findOne({name: regions[i]});
                if(find==null){
                    find = new RegionShoro({
                        name: regions[i],
                    });
                    await RegionShoro.create(find);
                }
            }
        });
    } catch(error) {
        console.error(error)
    }
}

let addPoint = async () => {
    try{
        fs.readFile(path.join(app.dirname, 'points.txt'), 'utf8', async (err, contents) => {
            const points = contents.split('\n')
            for(let i=0; i<points.length; i++){
                points[i] = points[i].split(':')
                points[i][1] = points[i][1].replace('\r', '')
                let find = await PointShoro.findOne({name: points[i][1], region: points[i][0]});
                if(find==null){
                    find = new PointShoro({
                        name: points[i][1], region: points[i][0]
                    });
                    await PointShoro.create(find);
                }
            }
        });
    } catch(error) {
        console.error(error)
    }
}

let addReserv = async () => {
    try{
        let find = await RegionShoro.findOne({name: 'Резерв'});
        if(find==null){
            find = new RegionShoro({
                name: 'Резерв',
                guid: 'lol'
            });
            await RegionShoro.create(find);
            find = new PointShoro({
                name: 'Резерв',
                guid: 'lol',
                region: 'Резерв',
                guidRegion: 'lol'
            });
            await PointShoro.create(find);
        }
    } catch(error) {
        console.error(error)
    }
}

let start = async () => {
    await addReserv()
    await deleteAll()
    /*await addPoint()
    await addRegion()
    await addOrganizator()
    await addRealizator()
    console.log('lol')*/
}

module.exports.start = start;
