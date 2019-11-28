//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require('mongoose');
let UserArchiCoin = require('../models/userArchiCoin');
const jwtsecret = '@615141ViDiK141516@';
const jwt = require('jsonwebtoken');

//Подключаем dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
const adminLogin = require('../module/const').adminLogin
let token;
chai.use(chaiHttp);
//Наш основной блок
describe('Users', () => {
    /*
      * Тест для /GET
      */
    describe('/GET users', () => {
        it('it should GET all the users', async (done) => {
            let findAdmin = await UserArchiCoin.findOne({email: adminLogin});
            const payload = {
                id: findAdmin._id,
                email: findAdmin.email,
                status: findAdmin.status,
                role: findAdmin.role
            };
            token = await jwt.sign(payload, jwtsecret);
            let req = await chai.request(server)
                .get('/users')
                .set('accept', 'application/json')
                .set('Accept-Language', 'en-US,en;q=0.8')
                .set('X-Requested-With', 'XMLHttpRequest')
                .set('Authorization', 'Bearer '+token)
                .send()
            await req.res.should.have.status(200);
            /*res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);*/
                    done();
        });
    });

});