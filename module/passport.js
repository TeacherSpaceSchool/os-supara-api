const passport = require('passport');
const LocalStrategy = require('passport-local');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtsecret = '@615141ViDiK141516@';
const UserAzyk = require('../models/userAzyk');
const ClientAzyk = require('../models/clientAzyk');
const EmploymentAzyk = require('../models/employmentAzyk');
const { setProfile, getProfile } = require('../redis/profile');
const jwt = require('jsonwebtoken');

let start = () => {
//настройка паспорта
    passport.use(new LocalStrategy({
            usernameField: 'phone',
            passwordField: 'password',
            session: false
        },
        function (phone, password, done) {
            UserAzyk.findOne({phone: phone}, (err, user) => {
                if (err) {
                    return done(err);
                }

                if (!user || !user.checkPassword(password) || user.status!=='active') {
                    return done(null, false, {message: 'Нет такого пользователя или пароль неверен.'});
                }
                return done(null, user);
            });
        }
        )
    );
    const jwtOptions = {};
    jwtOptions.jwtFromRequest= ExtractJwt.fromAuthHeaderAsBearerToken();
    jwtOptions.secretOrKey=jwtsecret;
    passport.use(new JwtStrategy(jwtOptions, function (payload, done) {
        UserAzyk.findOne({phone:payload.phone}, (err, user) => {
                if (err) {
                    return done(err)
                }
                if (user) {
                    return done(null, user)
                } else {
                    return done(null, false)
                }
            })
        })
    );
}

const verifydrole = async (req, res, func) => {
    await passport.authenticate('jwt', async function (err, user) {
        try{
            if (user&&user.status==='active') {
                await func(user.role)
            } else {
                console.error('No such user')
                res.status(401);
                res.end('No such user');
            }
        } catch (err) {
            console.error(err)
            res.status(401);
            res.end('err')
        }
    } )(req, res)
}

const verifydeuser = async (req, res, func) => {
    await passport.authenticate('jwt', async function (err, user) {
        try{
            if (user&&user.status==='active') {
                await func(user)
            } else {
                console.error('No such user')
                res.status(401);
                res.end('No such user');
            }
        } catch (err) {
            console.error(err)
            res.status(401);
            res.end('err')
        }
    } )(req, res)
}

const verifydeuserGQL = async (req, res) => {
    return new Promise((resolve) => { passport.authenticate('jwt', async function (err, user) {
        try{
            if (user&&user.status==='active') {
                if('admin'===user.role)
                    resolve(user)
                else if('client'===user.role) {
                    let client = await ClientAzyk.findOne({user: user._id})
                    user.client = client._id
                    resolve(user)

                }
                else {


                    let employment = await EmploymentAzyk.findOne({user: user._id}).populate({ path: 'organization' })
                    if(employment.organization.status==='active') {
                        user.organization = employment.organization._id
                        user.employment = employment._id
                        resolve(user)
                    }
                    else {
                        resolve({})
                    }
                }
            } else {
                resolve({})
            }
        } catch (err) {
            console.error(err)
            resolve({})
        }
    } )(req, res)
    })


}

const signinuser = (req, res) => {
    passport.authenticate('local', async function (err, user) {
        try{
            if (user&&user.status==='active') {
                const payload = {
                    id: user._id,
                    phone: user.phone,
                    status: user.status,
                    role: user.role
                };
                const token = await jwt.sign(payload, jwtsecret); //здесь создается JWT
                res.status(200);
                res.cookie('jwt', token, {maxAge: 500*24*60*60*1000}).end(token);
            } else {
                res.status(401);
                res.end('Login failed',401)
            }
        } catch (err) {
            console.error(err)
            res.status(401);
            res.end('phone not be unique')
        }
    })(req, res);
}

const getstatus = async (req, res) => {
    await passport.authenticate('jwt', async function (err, user) {
        try{
            if (user&&user.status==='active') {
                res.status(200);
                res.end(JSON.stringify({status: user.status, role: user.role, id: user._id}))
            } else {
                console.error('No such user')
                res.status(401);
                res.end('No such user');
            }
        } catch (err) {
            console.error(err)
            res.status(401);
            res.end('err')
        }
    } )(req, res)

}

const signupuser = async (req, res) => {
    try{
        let _user = new UserAzyk({
            phone: req.query.phone,
            role: 'client',
            status: 'active',
            password: req.query.password,
        });
        const user = await UserAzyk.create(_user);
        const payload = {
            id: user._id,
            phone: user.phone,
            status: user.status,
            role: user.role
        };
        const token = jwt.sign(payload, jwtsecret); //здесь создается JWT*/
        res.status(200);
        res.cookie('jwt', token, {maxAge: 500*24*60*60*1000}).end(token)
    } catch (err) {
        console.error(err)
        res.status(401);
        res.end('phone not be unique')
    }
}

const signupuserGQL = async ({password, phone}, res) => {
    try{
        //await UserAzyk.deleteMany()
        let user = new UserAzyk({
            phone: phone,
            role: 'client',
            status: 'active',
            password: password,
        });
        user = await UserAzyk.create(user);
        const client = new ClientAzyk({
            name: '',
            email: '',
            address: [],
            info: '',
            reiting: 0,
            image: '/static/add.png',
            user: user._id,
        });
        await ClientAzyk.create(client);
        const payload = {
            id: user._id,
            phone: user.phone,
            status: user.status,
            role: user.role
        };
        const token = jwt.sign(payload, jwtsecret); //здесь создается JWT*/
        res.cookie('jwt', token, {maxAge: 500*24*60*60*1000 })
        return {data: token}
    } catch (err) {
        console.error(err)
        return {data: 'Проверьте данные'}
    }
}

const signinuserGQL = (req, res) => {
    return new Promise((resolve) => {
        passport.authenticate('local', async function (err, user) {
            try{
                if (user&&user.status==='active') {
                    const payload = {
                        id: user._id,
                        phone: user.phone,
                        status: user.status,
                        role: user.role
                    };
                    const token = await jwt.sign(payload, jwtsecret); //здесь создается JWT
                    res.cookie('jwt', token, {maxAge: 500*24*60*60*1000 });
                    resolve({data: token})
                } else {
                    resolve({data: 'Проверьте данные'})
                }
            } catch (err) {
                console.error(err)
                resolve({data: 'Проверьте данные'})
            }
        })(req, res);
    })
}

const createJwtGQL = async (res, user) => {
    const payload = {
        id: user._id,
        phone: user.phone,
        status: user.status,
        role: user.role
    };
    const token = await jwt.sign(payload, jwtsecret); //здесь создается JWT
    res.cookie('jwt', token, {maxAge: 500*24*60*60*1000 });
}

module.exports.createJwtGQL = createJwtGQL;
module.exports.verifydrole = verifydrole;
module.exports.signupuserGQL = signupuserGQL;
module.exports.getstatus = getstatus;
module.exports.verifydeuserGQL = verifydeuserGQL;
module.exports.start = start;
module.exports.verifydeuser = verifydeuser;
module.exports.signinuser = signinuser;
module.exports.signinuserGQL = signinuserGQL;
module.exports.signupuser = signupuser;