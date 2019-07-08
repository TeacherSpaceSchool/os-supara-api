const OtchetRealizatoraShoro = require('../models/otchetRealizatoraShoro');
const monthWithDay = require('../module/const').monthWithDay;
const checkInt = require('../module/const').checkInt;
const month1 = require('../module/const').month1;

const calculateDay = async (data, date) => {
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

                if(addDataTable.vydano.d3.ml.length>0){
                    dolivkiM[i]=3
                }
                else if(addDataTable.vydano.d2.ml.length>0){
                    dolivkiM[i]=2
                }
                else if(addDataTable.vydano.d1.ml.length>0){
                    dolivkiM[i]=1
                }
                else {
                    dolivkiM[i]=0
                }

                if(addDataTable.vydano.d3.kl.length>0){
                    dolivkiK[i]=3
                }
                else if(addDataTable.vydano.d2.kl.length>0){
                    dolivkiK[i]=2
                }
                else if(addDataTable.vydano.d1.kl.length>0){
                    dolivkiK[i]=1
                }
                else {
                    dolivkiK[i]=0
                }

                if(addDataTable.vydano.d3.chl.length>0){
                    dolivkiCh[i]=3
                }
                else if(addDataTable.vydano.d2.chl.length>0){
                    dolivkiCh[i]=2
                }
                else if(addDataTable.vydano.d1.chl.length>0){
                    dolivkiCh[i]=1
                }
                else {
                    dolivkiCh[i]=0
                }

                if(addDataTable.vydano.d3.sl.length>0){
                    dolivkiSl[i]=3
                }
                else if(addDataTable.vydano.d2.sl.length>0){
                    dolivkiSl[i]=2
                }
                else if(addDataTable.vydano.d1.sl.length>0){
                    dolivkiSl[i]=1
                }
                else {
                    dolivkiSl[i]=0
                }


                if(addDataTable.vydano.d3.s02.length>0){
                    dolivkiS02[i]=3
                }
                else if(addDataTable.vydano.d2.s02.length>0){
                    dolivkiS02[i]=2
                }
                else if(addDataTable.vydano.d1.s02.length>0){
                    dolivkiS02[i]=1
                }
                else {
                    dolivkiS02[i]=0
                }

                if(addDataTable.vydano.d3.s04.length>0){
                    dolivkiS04[i]=3
                }
                else if(addDataTable.vydano.d2.s04.length>0){
                    dolivkiS04[i]=2
                }
                else if(addDataTable.vydano.d1.s04.length>0){
                    dolivkiS04[i]=1
                }
                else {
                    dolivkiS04[i]=0
                }

                if(addDataTable.vydano.d3.b!==0){
                    dolivkiB[i]=3
                }
                if(addDataTable.vydano.d1.b){
                    dolivkiB[i]=1
                }
                if(addDataTable.vydano.d2.b!==0){
                    dolivkiB[i]=2
                }

                a.m.v += checkInt(addDataTable.vydano.i.ml)
                a.ch.v += checkInt(addDataTable.vydano.i.chl)
                a.k.v += checkInt(addDataTable.vydano.i.kl)
                a.sl.v += checkInt(addDataTable.vydano.i.sl)
                a.s02.v += checkInt(addDataTable.vydano.i.s02)
                a.s04.v += checkInt(addDataTable.vydano.i.s04)
                a.b.v += checkInt(addDataTable.vydano.i.b)

                a.m.o += checkInt(addDataTable.vozvrat.v.ml)
                a.ch.o += checkInt(addDataTable.vozvrat.v.chl)
                a.k.o += checkInt(addDataTable.vozvrat.v.kl)
                a.sl.o += checkInt(addDataTable.vozvrat.v.sl)
                a.s02.o += checkInt(addDataTable.vozvrat.v.s02)
                a.s04.o += checkInt(addDataTable.vozvrat.v.s04)
                a.b.o += checkInt(addDataTable.vozvrat.v.b)

                a.m.s += checkInt(addDataTable.vozvrat.s.ml)
                a.ch.s += checkInt(addDataTable.vozvrat.s.chl)
                a.k.s += checkInt(addDataTable.vozvrat.s.kl)
                a.sl.s += checkInt(addDataTable.vozvrat.s.sl)
                a.s02.s += checkInt(addDataTable.vozvrat.s.s02)
                a.s04.s += checkInt(addDataTable.vozvrat.s.s04)
                a.b.s += checkInt(addDataTable.vozvrat.s.b)

                a.m.pl += checkInt(addDataTable.vozvrat.p.ml)
                a.ch.pl += checkInt(addDataTable.vozvrat.p.chl)
                a.k.pl += checkInt(addDataTable.vozvrat.p.kl)
                a.sl.pl += checkInt(addDataTable.vozvrat.p.sl)
                a.s02.pl += checkInt(addDataTable.vozvrat.p.s02)
                a.s04.pl += checkInt(addDataTable.vozvrat.p.s04)
                a.b.pl += checkInt(addDataTable.vozvrat.p.b)

                a.m.ps += checkInt(addDataTable.vozvrat.virychka.ml)
                a.ch.ps += checkInt(addDataTable.vozvrat.virychka.chl)
                a.k.ps += checkInt(addDataTable.vozvrat.virychka.kl)
                a.sl.ps += checkInt(addDataTable.vozvrat.virychka.sl)
                a.s02.ps += checkInt(addDataTable.vozvrat.virychka.s02)
                a.s04.ps += checkInt(addDataTable.vozvrat.virychka.s04)
                a.b.ps += checkInt(addDataTable.vozvrat.virychka.b)




                a.ntp += checkInt(addDataTable.i.n)
                a.att += checkInt(addDataTable.i.m)
                a.inc += checkInt(addDataTable.i.inc)
            }
        }
        a.m.ktt = x
        a.ch.ktt = x
        a.k.ktt = x
        a.sl.ktt = x
        a.s02.ktt = x
        a.s04.ktt = x
        a.b.ktt = x
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

const calculateMonth = async (data, date) => {
    let res = []

    for(let i = 0; i<month1.length; i++){
        let day = month1[i] + ' ' + date
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
            if((data[i1].data).includes(day)) {
                x+=1
                let addDataTable = JSON.parse(data[i1].dataTable)

                if(addDataTable.vydano.d3.ml.length>0){
                    dolivkiM[i]=3
                }
                else if(addDataTable.vydano.d2.ml.length>0){
                    dolivkiM[i]=2
                }
                else if(addDataTable.vydano.d1.ml.length>0){
                    dolivkiM[i]=1
                }
                else {
                    dolivkiM[i]=0
                }

                if(addDataTable.vydano.d3.kl.length>0){
                    dolivkiK[i]=3
                }
                else if(addDataTable.vydano.d2.kl.length>0){
                    dolivkiK[i]=2
                }
                else if(addDataTable.vydano.d1.kl.length>0){
                    dolivkiK[i]=1
                }
                else {
                    dolivkiK[i]=0
                }

                if(addDataTable.vydano.d3.chl.length>0){
                    dolivkiCh[i]=3
                }
                else if(addDataTable.vydano.d2.chl.length>0){
                    dolivkiCh[i]=2
                }
                else if(addDataTable.vydano.d1.chl.length>0){
                    dolivkiCh[i]=1
                }
                else {
                    dolivkiCh[i]=0
                }

                if(addDataTable.vydano.d3.sl.length>0){
                    dolivkiSl[i]=3
                }
                else if(addDataTable.vydano.d2.sl.length>0){
                    dolivkiSl[i]=2
                }
                else if(addDataTable.vydano.d1.sl.length>0){
                    dolivkiSl[i]=1
                }
                else {
                    dolivkiSl[i]=0
                }


                if(addDataTable.vydano.d3.s02.length>0){
                    dolivkiS02[i]=3
                }
                else if(addDataTable.vydano.d2.s02.length>0){
                    dolivkiS02[i]=2
                }
                else if(addDataTable.vydano.d1.s02.length>0){
                    dolivkiS02[i]=1
                }
                else {
                    dolivkiS02[i]=0
                }

                if(addDataTable.vydano.d3.s04.length>0){
                    dolivkiS04[i]=3
                }
                else if(addDataTable.vydano.d2.s04.length>0){
                    dolivkiS04[i]=2
                }
                else if(addDataTable.vydano.d1.s04.length>0){
                    dolivkiS04[i]=1
                }
                else {
                    dolivkiS04[i]=0
                }

                if(addDataTable.vydano.d3.b!==0){
                    dolivkiB[i]=3
                }
                if(addDataTable.vydano.d1.b){
                    dolivkiB[i]=1
                }
                if(addDataTable.vydano.d2.b!==0){
                    dolivkiB[i]=2
                }

                a.m.v += checkInt(addDataTable.vydano.i.ml)
                a.ch.v += checkInt(addDataTable.vydano.i.chl)
                a.k.v += checkInt(addDataTable.vydano.i.kl)
                a.sl.v += checkInt(addDataTable.vydano.i.sl)
                a.s02.v += checkInt(addDataTable.vydano.i.s02)
                a.s04.v += checkInt(addDataTable.vydano.i.s04)
                a.b.v += checkInt(addDataTable.vydano.i.b)

                a.m.o += checkInt(addDataTable.vozvrat.v.ml)
                a.ch.o += checkInt(addDataTable.vozvrat.v.chl)
                a.k.o += checkInt(addDataTable.vozvrat.v.kl)
                a.sl.o += checkInt(addDataTable.vozvrat.v.sl)
                a.s02.o += checkInt(addDataTable.vozvrat.v.s02)
                a.s04.o += checkInt(addDataTable.vozvrat.v.s04)
                a.b.o += checkInt(addDataTable.vozvrat.v.b)

                a.m.s += checkInt(addDataTable.vozvrat.s.ml)
                a.ch.s += checkInt(addDataTable.vozvrat.s.chl)
                a.k.s += checkInt(addDataTable.vozvrat.s.kl)
                a.sl.s += checkInt(addDataTable.vozvrat.s.sl)
                a.s02.s += checkInt(addDataTable.vozvrat.s.s02)
                a.s04.s += checkInt(addDataTable.vozvrat.s.s04)
                a.b.s += checkInt(addDataTable.vozvrat.s.b)

                a.m.pl += checkInt(addDataTable.vozvrat.p.ml)
                a.ch.pl += checkInt(addDataTable.vozvrat.p.chl)
                a.k.pl += checkInt(addDataTable.vozvrat.p.kl)
                a.sl.pl += checkInt(addDataTable.vozvrat.p.sl)
                a.s02.pl += checkInt(addDataTable.vozvrat.p.s02)
                a.s04.pl += checkInt(addDataTable.vozvrat.p.s04)
                a.b.pl += checkInt(addDataTable.vozvrat.p.b)

                a.m.ps += checkInt(addDataTable.vozvrat.virychka.ml)
                a.ch.ps += checkInt(addDataTable.vozvrat.virychka.chl)
                a.k.ps += checkInt(addDataTable.vozvrat.virychka.kl)
                a.sl.ps += checkInt(addDataTable.vozvrat.virychka.sl)
                a.s02.ps += checkInt(addDataTable.vozvrat.virychka.s02)
                a.s04.ps += checkInt(addDataTable.vozvrat.virychka.s04)
                a.b.ps += checkInt(addDataTable.vozvrat.virychka.b)




                a.ntp += checkInt(addDataTable.i.n)
                a.att += checkInt(addDataTable.i.m)
                a.inc += checkInt(addDataTable.i.inc)
            }
        }
        a.m.ktt = x
        a.ch.ktt = x
        a.k.ktt = x
        a.sl.ktt = x
        a.s02.ktt = x
        a.s04.ktt = x
        a.b.ktt = x
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

const calculateYear = async (data) => {
    let res = []

    for(let i = 2000; i<2100; i++){
        let day = i.toString()

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
            console.log(data[i1].data)
            if((data[i1].data).includes(day)) {
                x+=1
                let addDataTable = JSON.parse(data[i1].dataTable)

                if(addDataTable.vydano.d3.ml.length>0){
                    dolivkiM[i]=3
                }
                else if(addDataTable.vydano.d2.ml.length>0){
                    dolivkiM[i]=2
                }
                else if(addDataTable.vydano.d1.ml.length>0){
                    dolivkiM[i]=1
                }
                else {
                    dolivkiM[i]=0
                }

                if(addDataTable.vydano.d3.kl.length>0){
                    dolivkiK[i]=3
                }
                else if(addDataTable.vydano.d2.kl.length>0){
                    dolivkiK[i]=2
                }
                else if(addDataTable.vydano.d1.kl.length>0){
                    dolivkiK[i]=1
                }
                else {
                    dolivkiK[i]=0
                }

                if(addDataTable.vydano.d3.chl.length>0){
                    dolivkiCh[i]=3
                }
                else if(addDataTable.vydano.d2.chl.length>0){
                    dolivkiCh[i]=2
                }
                else if(addDataTable.vydano.d1.chl.length>0){
                    dolivkiCh[i]=1
                }
                else {
                    dolivkiCh[i]=0
                }

                if(addDataTable.vydano.d3.sl.length>0){
                    dolivkiSl[i]=3
                }
                else if(addDataTable.vydano.d2.sl.length>0){
                    dolivkiSl[i]=2
                }
                else if(addDataTable.vydano.d1.sl.length>0){
                    dolivkiSl[i]=1
                }
                else {
                    dolivkiSl[i]=0
                }


                if(addDataTable.vydano.d3.s02.length>0){
                    dolivkiS02[i]=3
                }
                else if(addDataTable.vydano.d2.s02.length>0){
                    dolivkiS02[i]=2
                }
                else if(addDataTable.vydano.d1.s02.length>0){
                    dolivkiS02[i]=1
                }
                else {
                    dolivkiS02[i]=0
                }

                if(addDataTable.vydano.d3.s04.length>0){
                    dolivkiS04[i]=3
                }
                else if(addDataTable.vydano.d2.s04.length>0){
                    dolivkiS04[i]=2
                }
                else if(addDataTable.vydano.d1.s04.length>0){
                    dolivkiS04[i]=1
                }
                else {
                    dolivkiS04[i]=0
                }

                if(addDataTable.vydano.d3.b!==0){
                    dolivkiB[i]=3
                }
                if(addDataTable.vydano.d1.b){
                    dolivkiB[i]=1
                }
                if(addDataTable.vydano.d2.b!==0){
                    dolivkiB[i]=2
                }

                a.m.v += checkInt(addDataTable.vydano.i.ml)
                a.ch.v += checkInt(addDataTable.vydano.i.chl)
                a.k.v += checkInt(addDataTable.vydano.i.kl)
                a.sl.v += checkInt(addDataTable.vydano.i.sl)
                a.s02.v += checkInt(addDataTable.vydano.i.s02)
                a.s04.v += checkInt(addDataTable.vydano.i.s04)
                a.b.v += checkInt(addDataTable.vydano.i.b)

                a.m.o += checkInt(addDataTable.vozvrat.v.ml)
                a.ch.o += checkInt(addDataTable.vozvrat.v.chl)
                a.k.o += checkInt(addDataTable.vozvrat.v.kl)
                a.sl.o += checkInt(addDataTable.vozvrat.v.sl)
                a.s02.o += checkInt(addDataTable.vozvrat.v.s02)
                a.s04.o += checkInt(addDataTable.vozvrat.v.s04)
                a.b.o += checkInt(addDataTable.vozvrat.v.b)

                a.m.s += checkInt(addDataTable.vozvrat.s.ml)
                a.ch.s += checkInt(addDataTable.vozvrat.s.chl)
                a.k.s += checkInt(addDataTable.vozvrat.s.kl)
                a.sl.s += checkInt(addDataTable.vozvrat.s.sl)
                a.s02.s += checkInt(addDataTable.vozvrat.s.s02)
                a.s04.s += checkInt(addDataTable.vozvrat.s.s04)
                a.b.s += checkInt(addDataTable.vozvrat.s.b)

                a.m.pl += checkInt(addDataTable.vozvrat.p.ml)
                a.ch.pl += checkInt(addDataTable.vozvrat.p.chl)
                a.k.pl += checkInt(addDataTable.vozvrat.p.kl)
                a.sl.pl += checkInt(addDataTable.vozvrat.p.sl)
                a.s02.pl += checkInt(addDataTable.vozvrat.p.s02)
                a.s04.pl += checkInt(addDataTable.vozvrat.p.s04)
                a.b.pl += checkInt(addDataTable.vozvrat.p.b)

                a.m.ps += checkInt(addDataTable.vozvrat.virychka.ml)
                a.ch.ps += checkInt(addDataTable.vozvrat.virychka.chl)
                a.k.ps += checkInt(addDataTable.vozvrat.virychka.kl)
                a.sl.ps += checkInt(addDataTable.vozvrat.virychka.sl)
                a.s02.ps += checkInt(addDataTable.vozvrat.virychka.s02)
                a.s04.ps += checkInt(addDataTable.vozvrat.virychka.s04)
                a.b.ps += checkInt(addDataTable.vozvrat.virychka.b)




                a.ntp += checkInt(addDataTable.i.n)
                a.att += checkInt(addDataTable.i.m)
                a.inc += checkInt(addDataTable.i.inc)
            }
        }
        a.m.ktt = x
        a.ch.ktt = x
        a.k.ktt = x
        a.sl.ktt = x
        a.s02.ktt = x
        a.s04.ktt = x
        a.b.ktt = x
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


const getStatistic = async (type, what, date, status) => {
    if(what==='все')
        what = ''
    if(type==='регион'){
        let statistic = await OtchetRealizatoraShoro.find({region: {'$regex': what, '$options': 'i'}, data: {'$regex': date, '$options': 'i'}})
        if(status === 'по годам')
            return calculateYear(statistic, date)
        else if(status === 'по месяцам')
            return calculateMonth(statistic, date)
        else if(status === 'по дням')
            return calculateDay(statistic, date)
    }
    else if(type==='точка'){
        let statistic = await OtchetRealizatoraShoro.find({point: {'$regex': what, '$options': 'i'}, data: {'$regex': date, '$options': 'i'}})
        if(status === 'по годам')
            return calculateYear(statistic, date)
        else if(status === 'по месяцам')
            return calculateMonth(statistic, date)
        else if(status === 'по дням')
            return calculateDay(statistic, date)
    }
    else if(type==='организатор'){
        let statistic = await OtchetRealizatoraShoro.find({organizator: {'$regex': what, '$options': 'i'}, data: {'$regex': date, '$options': 'i'}})
        if(status === 'по годам')
            return calculateYear(statistic, date)
        else if(status === 'по месяцам')
            return calculateMonth(statistic, date)
        else if(status === 'по дням')
            return calculateDay(statistic, date)
    }
    else if(type==='реализатор'){
        let statistic = await OtchetRealizatoraShoro.find({realizator: {'$regex': what, '$options': 'i'}, data: {'$regex': date, '$options': 'i'}})
        if(status === 'по годам')
            return calculateYear(statistic, date)
        else if(status === 'по месяцам')
            return calculateMonth(statistic, date)
        else if(status === 'по дням')
            return calculateDay(statistic, date)
    }
}

module.exports.getStatistic = getStatistic;