const express = require('express');
const router = express.Router();
const passportEngine = require('../module/passport');
const BlogShoro = require('../module/blogShoro');
const CarShoro = require('../module/carShoro');
const OrganizatorShoro = require('../module/organizatorShoro');
const PlanShoro = require('../module/planShoro');
const PointShoro = require('../module/pointShoro');
const PriceShoro = require('../module/priceShoro');
const RealizatorShoro = require('../module/realizatorShoro');
const RegionShoro = require('../module/regionShoro');
const ZavSkladShoro = require('../module/zavSkladShoro');
const NakladnayaNaPustuyTaruShoro = require('../module/nakladnayaNaPustuyTaruShoro');
const NakladnayaSklad1Shoro = require('../module/nakladnayaSklad1Shoro');
const NakladnayaNaVecherniyVozvratShoro = require('../module/nakladnayaNaVecherniyVozvratShoro');
const OtchetOrganizatoraShoro = require('../module/otchetOrganizatoraShoro');
const OtchetRealizatoraShoro = require('../module/otchetRealizatoraShoro');
const myConst = require('../module/const');
const randomstring = require('randomstring');
const app = require('../app');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const NakladnayaSklad2Shoro = require('../module/nakladnayaSklad2Shoro');

router.post('/get', async (req, res) => {
    await passportEngine.verifydrole(req, res, async (role)=>{
        if(role==='admin'){
            await passportEngine.verifydadmin(req, res, async ()=>{
                let data;
                if (req.body.data!==undefined)
                    data = JSON.parse(req.body.data);
                if(req.body.name == 'Блог'){
                    await res.send(await BlogShoro.getBlogShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Машина'){
                    await res.send(await CarShoro.getCarShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Организатор'){
                    await res.send(await OrganizatorShoro.getOrganizatorShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'План'){
                    await res.send(await PlanShoro.getPlanShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Точка'){
                    await res.send(await PointShoro.getPointShoro(req.body.search, req.body.sort, req.body.skip))
                }  else if(req.body.name == 'Цена'){
                    await res.send(await PriceShoro.getPriceShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Реализатор'){
                    await res.send(await RealizatorShoro.getRealizatorShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'РеализаторПоИмени'){
                    await res.send(await RealizatorShoro.getRealizatorShoroByName(data.name, data.point))
                } else if(req.body.name == 'ОрганизаторПоИмени'){
                    await res.send(await OrganizatorShoro.getOrganizatorShoroByName(data.name, data.region))
                } else if(req.body.name == 'ЗавскладаПоИмени'){
                    await res.send(await ZavSkladShoro.getZavSkladShoroByName(data.name))
                } else if(req.body.name == 'РегионИмя'){
                    await res.send(await RegionShoro.getRegionShoroName())
                } else if(req.body.name == 'ТочкаИмя'){
                    await res.send(await PointShoro.getPointShoroName())
                } else if(req.body.name == 'ТочкаПоРегиону'){
                    await res.send(await PointShoro.getPointShoroRegion(data.region))
                } else if(req.body.name == 'Регион'){
                    await res.send(await RegionShoro.getRegionShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Завсклада'){
                    await res.send(await ZavSkladShoro.getZavSkladShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'ПланПоДате'){
                    await res.send(await PlanShoro.getPlanShoroByDate(data.date))
                } else if(req.body.name == 'Накладная на пустую тару'){
                    await res.send(await NakladnayaNaPustuyTaruShoro.getNakladnayaNaPustuyTaruShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Накладная на пустую тару по данным'){
                    await res.send(await NakladnayaNaPustuyTaruShoro.getNakladnayaNaPustuyTaruShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Накладная на вечерний возврат'){
                    await res.send(await NakladnayaNaVecherniyVozvratShoro.getNakladnayaNaVecherniyVozvratShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Накладная на вечерний возврат по данным'){
                    await res.send(await NakladnayaNaVecherniyVozvratShoro.getNakladnayaNaVecherniyVozvratShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Накладная склад №1'){
                    await res.send(await NakladnayaSklad1Shoro.getNakladnayaSklad1Shoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Накладная склад №1 по данным'){
                    await res.send(await NakladnayaSklad1Shoro.getNakladnayaSklad1ShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Накладная склад №2'){
                    await res.send(await NakladnayaSklad2Shoro.getNakladnayaSklad2Shoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Накладная склад №2 по данным'){
                    await res.send(await NakladnayaSklad2Shoro.getNakladnayaSklad2ShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Отчет организатора'){
                    await res.send(await OtchetOrganizatoraShoro.getOtchetOrganizatoraShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Отчет организатора по данным'){
                    await res.send(await OtchetOrganizatoraShoro.getOtchetOrganizatoraShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Отчет реализатора'){
                    await res.send(await OtchetRealizatoraShoro.getOtchetRealizatoraShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Отчет реализатора по данным'){
                    await res.send(await OtchetRealizatoraShoro.getOtchetRealizatoraShoroByData(data.data, data.realizator, data.region, data.point))
                }
            });
        }
        else if(role==='организатор'){
            await passportEngine.verifydorganizator(req, res, async (user)=>{
                let data;
                if (req.body.data!==undefined)
                    data = JSON.parse(req.body.data);
                if(req.body.name == 'Накладная на пустую тару'){
                    await res.send(await NakladnayaNaPustuyTaruShoro.getNakladnayaNaPustuyTaruShoroOrganizator(req.body.search, req.body.sort, req.body.skip, user._id))
                } else if(req.body.name == 'ОрганизаторПоИмени'){
                    await res.send(await OrganizatorShoro.getOrganizatorShoroByName(data.name, data.region))
                } else if(req.body.name == 'ОрганизаторПоID'){
                    await res.send(await OrganizatorShoro.getOrganizatorShoroById(user._id))
                } else if(req.body.name == 'Накладная на пустую тару по данным'){
                    await res.send(await NakladnayaNaPustuyTaruShoro.getNakladnayaNaPustuyTaruShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Накладная склад №1 по данным'){
                    await res.send(await NakladnayaSklad1Shoro.getNakladnayaSklad1ShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Накладная склад №1'){
                    await res.send(await NakladnayaSklad1Shoro.getNakladnayaSklad1ShoroOrganizator(req.body.search, req.body.sort, req.body.skip, user._id))
                } else if(req.body.name == 'Накладная склад №2 по данным'){
                    await res.send(await NakladnayaSklad2Shoro.getNakladnayaSklad2ShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Накладная склад №2'){
                    await res.send(await NakladnayaSklad2Shoro.getNakladnayaSklad2ShoroOrganizator(req.body.search, req.body.sort, req.body.skip, user._id))
                } else if(req.body.name == 'Накладная на вечерний возврат по данным'){
                    await res.send(await NakladnayaNaVecherniyVozvratShoro.getNakladnayaNaVecherniyVozvratShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Накладная на вечерний возврат'){
                    await res.send(await NakladnayaNaVecherniyVozvratShoro.getNakladnayaNaVecherniyVozvratShoroOrganizator(req.body.search, req.body.sort, req.body.skip, user._id))
                } else if(req.body.name == 'Отчет организатора по данным'){
                    await res.send(await OtchetOrganizatoraShoro.getOtchetOrganizatoraShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Отчет организатора'){
                    await res.send(await OtchetOrganizatoraShoro.getOtchetOrganizatoraShoroOrganizator(req.body.search, req.body.sort, req.body.skip, user._id))
                } else if(req.body.name == 'Номера авто'){
                    await res.send(await CarShoro.getCarNumber())
                } else if(req.body.name == 'Отчет реализатора'){
                    await res.send(await OtchetRealizatoraShoro.getOtchetRealizatoraShoroOrganizator(req.body.search, req.body.sort, req.body.skip, user._id))
                } else if(req.body.name == 'Отчет реализатора по данным'){
                    await res.send(await OtchetRealizatoraShoro.getOtchetRealizatoraShoroByData(data.data, data.realizator, data.region, data.point))
                }
            });
        }
        else if(role==='реализатор'){
            await passportEngine.verifydrealizator(req, res, async (user)=>{
                let data;
                if (req.body.data!==undefined)
                    data = JSON.parse(req.body.data);
                if(req.body.name == 'Отчет реализатора'){
                    await res.send(await OtchetRealizatoraShoro.getOtchetRealizatoraShoroRealizator(req.body.search, req.body.sort, req.body.skip, user._id))
                } else if(req.body.name == 'Отчет реализатора по данным'){
                    await res.send(await OtchetRealizatoraShoro.getOtchetRealizatoraShoroByData(data.data, data.realizator, data.region, data.point))
                } else if(req.body.name == 'РеализаторПоID'){
                    await res.send(await RealizatorShoro.getRealizatorShoroById(user._id))
                }  else if(req.body.name == 'Цена'){
                    await res.send(await PriceShoro.getPriceShoroAll())
                }
            });
        }
        else if(role==='завсклада'){
            await passportEngine.verifydzavsklad(req, res, async ()=>{
                let data;
                if (req.body.data!==undefined)
                    data = JSON.parse(req.body.data);
                if(req.body.name == 'Накладная на пустую тару'){
                    await res.send(await NakladnayaNaPustuyTaruShoro.getNakladnayaNaPustuyTaruShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Накладная на пустую тару по данным'){
                    await res.send(await NakladnayaNaPustuyTaruShoro.getNakladnayaNaPustuyTaruShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Накладная склад №1'){
                    await res.send(await NakladnayaSklad1Shoro.getNakladnayaSklad1Shoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Накладная склад №1 по данным'){
                    await res.send(await NakladnayaSklad1Shoro.getNakladnayaSklad1ShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Накладная склад №2'){
                    await res.send(await NakladnayaSklad2Shoro.getNakladnayaSklad2Shoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Накладная склад №2 по данным'){
                    await res.send(await NakladnayaSklad2Shoro.getNakladnayaSklad2ShoroByData(data.data, data.organizator, data.region))
                } else if(req.body.name == 'Накладная на вечерний возврат'){
                    await res.send(await NakladnayaNaVecherniyVozvratShoro.getNakladnayaNaVecherniyVozvratShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Накладная на вечерний возврат по данным'){
                    await res.send(await NakladnayaNaVecherniyVozvratShoro.getNakladnayaNaVecherniyVozvratShoroByData(data.data, data.organizator, data.region))
                }
            });
        }
    })
});

router.post('/delete', async (req, res) => {
    await passportEngine.verifydrole(req, res, async (role)=> {
        if(role==='admin'){
            await passportEngine.verifydadmin(req, res, async ()=>{
                if(req.body.oldFile!=undefined) {
                    let image = req.body.oldFile.split('\n');
                    for(let i=0; i<image.length; i++){
                        if(image[i].length>0){
                            fs.unlink(image[i].replace(myConst.url + 'images/', path.join(app.dirname, 'public', 'images')+'\\'), ()=>{console.log('successfully deleted');})
                            fs.unlink(image[i].replace(myConst.url + 'images/', path.join(app.dirname, 'public', 'thumbnail')+'\\'), ()=>{console.log('successfully deleted');})
                        }
                    }
                }
                if(req.body.name == 'Блог'){
                    await BlogShoro.deleteBlogShoro(JSON.parse(req.body.deleted))
                    await res.send(await BlogShoro.getBlogShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Машина'){
                    await CarShoro.deleteCarShoro(JSON.parse(req.body.deleted))
                    await res.send(await CarShoro.getCarShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Организатор'){
                    await OrganizatorShoro.deleteOrganizatorShoro(JSON.parse(req.body.deleted))
                    await res.send(await OrganizatorShoro.getOrganizatorShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'План'){
                    await PlanShoro.deletePlanShoro(JSON.parse(req.body.deleted))
                    await res.send(await PlanShoro.getPlanShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Точка'){
                    await PointShoro.deletePointShoro(JSON.parse(req.body.deleted))
                    await res.send(await PointShoro.getPointShoro(req.body.search, req.body.sort, req.body.skip))
                }  else if(req.body.name == 'Цена'){
                    await PriceShoro.deletePriceShoro(JSON.parse(req.body.deleted))
                    await res.send(await PriceShoro.getPriceShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Реализатор'){
                    await RealizatorShoro.deleteRealizatorShoro(JSON.parse(req.body.deleted))
                    await res.send(await RealizatorShoro.getRealizatorShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Регион'){
                    await RegionShoro.deleteRegionShoro(JSON.parse(req.body.deleted))
                    await res.send(await RegionShoro.getRegionShoro(req.body.search, req.body.sort, req.body.skip))
                } else if(req.body.name == 'Завсклада'){
                    await ZavSkladShoro.deleteZavSkladShoro(JSON.parse(req.body.deleted))
                    await res.send(await ZavSkladShoro.getZavSkladShoro(req.body.search, req.body.sort, req.body.skip))
                }
            });
        }
    })
});

router.post('/add', async (req, res) => {
    await passportEngine.verifydrole(req, res, async (role)=> {
        if(role==='admin'){
            await passportEngine.verifydadmin(req, res, async ()=>{
                let data, myNew = JSON.parse(req.body.new), image = [], imageThumbnail = [];
                if(req.body.oldFile!=undefined) {
                    image = req.body.oldFile.split('\n');
                    for(let i = 0; i< image.length; i++){
                        imageThumbnail.push(image[i].replace('images', 'thumbnail'))
                    }
                }
                if(req.body.fileLength>0) {
                    for(let i=0; i<image.length; i++){
                        if(image[i].length>0){
                            fs.unlink(image[i].replace(myConst.url + 'images/', path.join(app.dirname, 'public', 'images')+'\\'), ()=>{console.log('successfully deleted');})
                            fs.unlink(imageThumbnail[i].replace(myConst.url + 'thumbnail/', path.join(app.dirname, 'public', 'thumbnail')+'\\'), ()=>{console.log('successfully deleted');})
                        }
                    }
                    image = []
                    imageThumbnail = []
                    for (let i = 0; i < parseInt(req.body.fileLength); i++) {
                        let filename = randomstring.generate(7) + req.body['fileName' + i];
                        let filepath = path.join(app.dirname, 'public', 'images', filename);
                        let filepathThumbnail = path.join(app.dirname, 'public', 'thumbnail', filename);
                        let fstream = fs.createWriteStream(filepath);
                        let stream = await req.body['file' + i].pipe(fstream);
                        image.push(myConst.url + 'images/' + filename)
                        imageThumbnail.push(myConst.url + 'thumbnail/' + filename)
                        stream.on('finish', async () => {
                            let image1 = await Jimp.read(filepath)
                            if(image1.bitmap.width>1500||image1.bitmap.height>1500) {
                                await image1.resize(1500, Jimp.AUTO).write(filepath);
                            }
                            await image1.resize(320, Jimp.AUTO).write(filepathThumbnail);
                            if(i===parseInt(req.body.fileLength)-1){
                                if(req.body.name == 'Блог'){
                                    myNew.image = image
                                    if(req.body.id==undefined)
                                        await BlogShoro.addBlogShoro(myNew)
                                    else
                                        await BlogShoro.setBlogShoro(myNew, req.body.id)
                                    await res.send(await BlogShoro.getBlogShoro(req.body.search, req.body.sort, req.body.skip))
                                } else if(req.body.name == 'Машина'){
                                    if(req.body.id==undefined)
                                        await CarShoro.addCarShoro(myNew)
                                    else
                                        await CarShoro.setCarShoro(myNew, req.body.id)
                                    await res.send(await CarShoro.getCarShoro(req.body.search, req.body.sort, req.body.skip))
                                } else if(req.body.name == 'Организатор'){
                                    if(req.body.id==undefined)
                                        await OrganizatorShoro.addOrganizatorShoro(myNew)
                                    else
                                        await OrganizatorShoro.setOrganizatorShoro(myNew, req.body.id)
                                    await res.send(await OrganizatorShoro.getOrganizatorShoro(req.body.search, req.body.sort, req.body.skip))
                                } else if(req.body.name == 'План'){
                                    if(req.body.id==undefined)
                                        await PlanShoro.addPlanShoro(myNew)
                                    else
                                        await PlanShoro.setPlanShoro(myNew, req.body.id)
                                    await res.send(await PlanShoro.getPlanShoro(req.body.search, req.body.sort, req.body.skip))
                                } else if(req.body.name == 'Точка'){
                                    if(req.body.id==undefined)
                                        await PointShoro.addPointShoro(myNew)
                                    else
                                        await PointShoro.setPointShoro(myNew, req.body.id)
                                    await res.send(await PointShoro.getPointShoro(req.body.search, req.body.sort, req.body.skip))
                                }  else if(req.body.name == 'Цена'){
                                    if(req.body.id==undefined)
                                        await PriceShoro.addPriceShoro(myNew)
                                    else
                                        await PriceShoro.setPriceShoro(myNew, req.body.id)
                                    await res.send(await PriceShoro.getPriceShoro(req.body.search, req.body.sort, req.body.skip))
                                } else if(req.body.name == 'Реализатор'){
                                    if(req.body.id==undefined)
                                        await RealizatorShoro.addRealizatorShoro(myNew)
                                    else
                                        await RealizatorShoro.setRealizatorShoro(myNew, req.body.id)
                                    await res.send(await RealizatorShoro.getRealizatorShoro(req.body.search, req.body.sort, req.body.skip))
                                } else if(req.body.name == 'Регион'){
                                    if(req.body.id==undefined)
                                        await RegionShoro.addRegionShoro(myNew)
                                    else
                                        await RegionShoro.setRealizatorShoro(myNew, req.body.id)
                                    await res.send(await RegionShoro.getRegionShoro(req.body.search, req.body.sort, req.body.skip))
                                } else if(req.body.name == 'Завсклада'){
                                    if(req.body.id==undefined)
                                        await ZavSkladShoro.addZavSkladShoro(myNew)
                                    else
                                        await ZavSkladShoro.setZavSkladShoro(myNew, req.body.id)
                                    await res.send(await ZavSkladShoro.getZavSkladShoro(req.body.search, req.body.sort, req.body.skip))
                                }
                            }
                        })
                    }
                } else {
                    if(req.body.name == 'Блог'){
                        if(req.body.id==undefined)
                            await BlogShoro.addBlogShoro(myNew)
                        else
                            await BlogShoro.setBlogShoro(myNew, req.body.id)
                        await res.send(await BlogShoro.getBlogShoro(req.body.search, req.body.sort, req.body.skip))
                    } else if(req.body.name == 'Машина'){
                        if(req.body.id==undefined)
                            await CarShoro.addCarShoro(myNew)
                        else
                            await CarShoro.setCarShoro(myNew, req.body.id)
                        await res.send(await CarShoro.getCarShoro(req.body.search, req.body.sort, req.body.skip))
                    } else if(req.body.name == 'Организатор'){
                        if(req.body.id==undefined)
                            await OrganizatorShoro.addOrganizatorShoro(myNew)
                        else
                            await OrganizatorShoro.setOrganizatorShoro(myNew, req.body.id)
                        await res.send(await OrganizatorShoro.getOrganizatorShoro(req.body.search, req.body.sort, req.body.skip))
                    } else if(req.body.name == 'План'){
                        if(req.body.id==undefined)
                            await PlanShoro.addPlanShoro(myNew)
                        else
                            await PlanShoro.setPlanShoro(myNew, req.body.id)
                        await res.send(await PlanShoro.getPlanShoro(req.body.search, req.body.sort, req.body.skip))
                    } else if(req.body.name == 'Точка'){
                        if(req.body.id==undefined)
                            await PointShoro.addPointShoro(myNew)
                        else
                            await PointShoro.setPointShoro(myNew, req.body.id)
                        await res.send(await PointShoro.getPointShoro(req.body.search, req.body.sort, req.body.skip))
                    }  else if(req.body.name == 'Цена'){
                        if(req.body.id==undefined)
                            await PriceShoro.addPriceShoro(myNew)
                        else
                            await PriceShoro.setPriceShoro(myNew, req.body.id)
                        await res.send(await PriceShoro.getPriceShoro(req.body.search, req.body.sort, req.body.skip))
                    } else if(req.body.name == 'Реализатор'){
                        if(req.body.id==undefined)
                            await RealizatorShoro.addRealizatorShoro(myNew)
                        else
                            await RealizatorShoro.setRealizatorShoro(myNew, req.body.id)
                        await res.send(await RealizatorShoro.getRealizatorShoro(req.body.search, req.body.sort, req.body.skip))
                    } else if(req.body.name == 'Регион'){
                        if(req.body.id==undefined)
                            await RegionShoro.addRegionShoro(myNew)
                        else
                            await RegionShoro.setRegionShoro(myNew, req.body.id)
                        await res.send(await RegionShoro.getRegionShoro(req.body.search, req.body.sort, req.body.skip))
                    } else if(req.body.name == 'Завсклада'){
                        if(req.body.id==undefined)
                            await ZavSkladShoro.addZavSkladShoro(myNew)
                        else
                            await ZavSkladShoro.setZavSkladShoro(myNew, req.body.id)
                        await res.send(await ZavSkladShoro.getZavSkladShoro(req.body.search, req.body.sort, req.body.skip))
                    }
                    else if(req.body.name == 'Отчет организатора'){
                        if(req.body.id!==undefined)
                            await OtchetOrganizatoraShoro.setOtchetOrganizatoraShoro(myNew, req.body.id)
                        await res.send(await OtchetOrganizatoraShoro.getOtchetOrganizatoraShoro(req.body.search, req.body.sort, req.body.skip))
                    }
                }
            });
        }
        else if(role==='организатор'){
            await passportEngine.verifydorganizator(req, res, async (user)=>{
                let myNew = JSON.parse(req.body.new);
                if(req.body.name == 'Накладная на пустую тару'){
                    if(req.body.id==undefined)
                        await NakladnayaNaPustuyTaruShoro.addNakladnayaNaPustuyTaruShoro(myNew)
                    else
                        await NakladnayaNaPustuyTaruShoro.setNakladnayaNaPustuyTaruShoro(myNew, req.body.id)
                    await res.send(await NakladnayaNaPustuyTaruShoro.getNakladnayaNaPustuyTaruShoroOrganizator(req.body.search, req.body.sort, req.body.skip, user._id))
                }
                else if(req.body.name == 'Накладная склад №1'){
                    if(req.body.id==undefined)
                        await NakladnayaSklad1Shoro.addNakladnayaSklad1Shoro(myNew)
                    else
                        await NakladnayaSklad1Shoro.setNakladnayaSklad1Shoro(myNew, req.body.id)
                    await res.send(await NakladnayaSklad1Shoro.getNakladnayaSklad1ShoroOrganizator(req.body.search, req.body.sort, req.body.skip, user._id))
                }
                else if(req.body.name == 'Накладная склад №2'){
                    if(req.body.id==undefined)
                        await NakladnayaSklad2Shoro.addNakladnayaSklad2Shoro(myNew)
                    else
                        await NakladnayaSklad2Shoro.setNakladnayaSklad2Shoro(myNew, req.body.id)
                    await res.send(await NakladnayaSklad2Shoro.getNakladnayaSklad2ShoroOrganizator(req.body.search, req.body.sort, req.body.skip, user._id))
                }
                else if(req.body.name == 'Накладная на вечерний возврат'){
                    if(req.body.id==undefined)
                        await NakladnayaNaVecherniyVozvratShoro.addNakladnayaNaVecherniyVozvratShoro(myNew)
                    else
                        await NakladnayaNaVecherniyVozvratShoro.setNakladnayaNaVecherniyVozvratShoro(myNew, req.body.id)
                    await res.send(await NakladnayaNaVecherniyVozvratShoro.getNakladnayaNaVecherniyVozvratShoroOrganizator(req.body.search, req.body.sort, req.body.skip, user._id))
                }
                else if(req.body.name == 'Отчет организатора'){
                    if(req.body.id==undefined)
                        await OtchetOrganizatoraShoro.addOtchetOrganizatoraShoro(myNew)
                    else
                        await OtchetOrganizatoraShoro.setOtchetOrganizatoraShoro(myNew, req.body.id)
                    await res.send(await OtchetOrganizatoraShoro.getOtchetOrganizatoraShoroOrganizator(req.body.search, req.body.sort, req.body.skip, user._id))
                }
            });
        }
        else if(role==='реализатор'){
            await passportEngine.verifydorganizator(req, res, async (user)=>{
                let myNew = JSON.parse(req.body.new);
                if(req.body.name == 'Отчет реализатора'){
                    if(req.body.id==undefined)
                        await OtchetRealizatoraShoro.addOtchetRealizatoraShoro(myNew)
                    else
                        await OtchetRealizatoraShoro.setOtchetRealizatoraShoro(myNew, req.body.id)
                    await res.send(await OtchetRealizatoraShoro.getOtchetRealizatoraShoroRealizator(req.body.search, req.body.sort, req.body.skip, user._id))
                }
            });
        }
        else if(role==='завсклада'){
            await passportEngine.verifydzavsklad(req, res, async ()=>{
                let myNew = JSON.parse(req.body.new);
                if(req.body.name == 'Накладная на пустую тару'){
                    if(req.body.id!==undefined)
                        await NakladnayaNaPustuyTaruShoro.setNakladnayaNaPustuyTaruShoro(myNew, req.body.id)
                    await res.send(await NakladnayaNaPustuyTaruShoro.getNakladnayaNaPustuyTaruShoro(req.body.search, req.body.sort, req.body.skip))
                }
                else if(req.body.name == 'Накладная склад №1'){
                    if(req.body.id!==undefined)
                        await NakladnayaSklad1Shoro.setNakladnayaSklad1Shoro(myNew, req.body.id)
                    await res.send(await NakladnayaSklad1Shoro.getNakladnayaSklad1Shoro(req.body.search, req.body.sort, req.body.skip))
                }
                else if(req.body.name == 'Накладная склад №2'){
                    if(req.body.id!==undefined)
                        await NakladnayaSklad2Shoro.setNakladnayaSklad2Shoro(myNew, req.body.id)
                    await res.send(await NakladnayaSklad2Shoro.getNakladnayaSklad2Shoro(req.body.search, req.body.sort, req.body.skip))
                }
                else if(req.body.name == 'Накладная на вечерний возврат'){
                    if(req.body.id!==undefined)
                        await NakladnayaNaVecherniyVozvratShoro.setNakladnayaNaVecherniyVozvratShoro(myNew, req.body.id)
                    await res.send(await NakladnayaNaVecherniyVozvratShoro.getNakladnayaNaVecherniyVozvratShoro(req.body.search, req.body.sort, req.body.skip))
                }

            });
        }
        })
});

module.exports = router;
