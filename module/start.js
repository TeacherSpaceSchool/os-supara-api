const RegionShoro = require('../models/regionShoro');
const PointShoro = require('../models/pointShoro');
const path = require('path');
const fs = require('fs');
const app = require('../app');

let addRegion = async () => {
    try{
        fs.readFile(path.join(app.dirname, 'nameSHoro.txt'), 'utf8', async (err, contents) => {
            const regions = contents.split('\n')
            for(let i=0; i<regions.length; i++){
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
        //await PointShoro.deleteMany()
        fs.readFile(path.join(app.dirname, 'RegionsShoro.txt'), 'utf8', async (err, contents) => {
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

let start = async () => {
    addPoint()
    addRegion()
}

module.exports.start = start;
