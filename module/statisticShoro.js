const OtchetRealizatoraShoro = require('../models/otchetRealizatoraShoro');
const monthWithDay = require('../module/const').monthWithDay;

const calculate = async (data, date) => {
    let res = []
    for(let i = 0; i<=monthWithDay[date.split(' ')[0]]; i++){
        let day = (i.toString().length===1?'0':'') + i.toString() + ' ' + date
        let a = {
            'i': 0,
            'm': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
            'ch': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
            'k': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
            'sl': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
            's02': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
            's04': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
            'b': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
            'ntp': 0, 'att': 0, 'inc': 0
        }
        let x = 0;
        let dolivkiM = [], dolivkiCh = [], dolivkiK = [], dolivkiSl = [], dolivkiS02 = [], dolivkiS04 = [], dolivkiB = []
        for(let i1 = 0; i1<data.length; i1++){
            if(data[i1].data === day) {
                x+=1
                let addDataTable = JSON.parse(data[i1].dataTable)
                a.m.v += addDataTable.vydano.i.ml
                a.ch.v += addDataTable.vydano.i.chl
                a.k.v += addDataTable.vydano.i.kl
                a.sl.v += addDataTable.vydano.i.sl
                a.s02.v += addDataTable.vydano.i.s02
                a.s04.v += addDataTable.vydano.i.s04
                a.b.v += addDataTable.vydano.i.b

                a.m.o += addDataTable.vozvrat.v.ml
                a.ch.o += addDataTable.vozvrat.v.chl
                a.k.o += addDataTable.vozvrat.v.kl
                a.sl.o += addDataTable.vozvrat.v.sl
                a.s02.o += addDataTable.vozvrat.v.s02
                a.s04.o += addDataTable.vozvrat.v.s04
                a.b.o += addDataTable.vozvrat.v.b

                a.m.s += addDataTable.vozvrat.s.ml
                a.ch.s += addDataTable.vozvrat.s.chl
                a.k.s += addDataTable.vozvrat.s.kl
                a.sl.s += addDataTable.vozvrat.s.sl
                a.s02.s += addDataTable.vozvrat.s.s02
                a.s04.s += addDataTable.vozvrat.s.s04
                a.b.s += addDataTable.vozvrat.s.b

                a.m.pl += addDataTable.vozvrat.p.ml
                a.ch.pl += addDataTable.vozvrat.p.chl
                a.k.pl += addDataTable.vozvrat.p.kl
                a.sl.pl += addDataTable.vozvrat.p.sl
                a.s02.pl += addDataTable.vozvrat.p.s02
                a.s04.pl += addDataTable.vozvrat.p.s04
                a.b.pl += addDataTable.vozvrat.p.b

                a.m.ps += addDataTable.vozvrat.virychka.ml
                a.ch.ps += addDataTable.vozvrat.virychka.chl
                a.k.ps += addDataTable.vozvrat.virychka.kl
                a.sl.ps += addDataTable.vozvrat.virychka.sl
                a.s02.ps += addDataTable.vozvrat.virychka.s02
                a.s04.ps += addDataTable.vozvrat.virychka.s04
                a.b.ps += addDataTable.vozvrat.virychka.b


                a.ntp += addDataTable.i.n
                a.att += addDataTable.i.m
                a.inc += addDataTable.i.inc
            }
        }
        a['i'] = a['m']['ps'] + a['ch']['ps'] + a['k']['ps'] + a['sl']['ps']
        a.m.kd = dolivkiM.length>0?Math.max.apply(Math, dolivkiM):0;
        a.k.kd = dolivkiK.length>0?Math.max.apply(Math, dolivkiK):0;
        a.ch.kd = dolivkiCh.length>0?Math.max.apply(Math, dolivkiCh):0;
        a.sl.kd = dolivkiSl.length>0?Math.max.apply(Math, dolivkiSl):0;
        a.s02.kd = dolivkiM.length>0?Math.max.apply(Math, dolivkiS02):0;
        a.s04.kd = dolivkiK.length>0?Math.max.apply(Math, dolivkiS04):0;
        a.b.kd = dolivkiCh.length>0?Math.max.apply(Math, dolivkiB):0;
        if(x!==0) {
            res.push({date: day, data: a})
        }
    }
    return res
}

const getStatistic = async (type, what, date) => {
    if(what==='все')
        what = ''
    if(type==='регион'){
        let statistic = await OtchetRealizatoraShoro.find({region: {'$regex': what, '$options': 'i'}, data: {'$regex': date, '$options': 'i'}})
        return calculate(statistic, date)
    }
    else if(type==='точка'){
        let statistic = await OtchetRealizatoraShoro.find({point: {'$regex': what, '$options': 'i'}, data: {'$regex': date, '$options': 'i'}})
        return calculate(statistic, date)
    }
    else if(type==='организатор'){
        let statistic = await OtchetRealizatoraShoro.find({organizator: {'$regex': what, '$options': 'i'}, data: {'$regex': date, '$options': 'i'}})
        return calculate(statistic, date)
    }
    else if(type==='реализатор'){
        let statistic = await OtchetRealizatoraShoro.find({realizator: {'$regex': what, '$options': 'i'}, data: {'$regex': date, '$options': 'i'}})
        return calculate(statistic, date)
    }
}

module.exports.getStatistic = getStatistic;