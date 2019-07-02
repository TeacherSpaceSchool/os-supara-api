const passport = require('passport');
const LocalStrategy = require('passport-local');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtsecret = '@615141ViDiK141516@';
const UserShoro = require('../models/userShoro');
const jwt = require('jsonwebtoken');
const socketioJwt = require('socketio-jwt');

let start = () => {
//настройка паспорта
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            session: false
        },
        function (email, password, done) {
            UserShoro.findOne({email: email}, (err, user) => {
                if (err) {
                    return done(err);
                }

                if (!user || !user.checkPassword(password) || user.status!='active') {
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
            UserShoro.findOne({email:payload.email}, (err, user) => {
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

const verifydadmin = async (req, res, func) => {
    await passport.authenticate('jwt', async function (err, user) {
        try{
            if (user&&user.status==='active'&&(user.role==='admin'||user.role==='manager')) {
                await func()
            } else {
                console.error('No such user')
                res.status(401);
                res.end('No such user');
            }
        } catch (err) {
            console.error(err)
            res.status(401);
            res.end(JSON.stringify(err.message))
        }
    } )(req, res)
}

const verifydorganizator = async (req, res, func) => {
    await passport.authenticate('jwt', async function (err, user) {
        try{
            if (user&&user.status==='active'&&(user.role==='admin'||user.role==='manager'||user.role==='организатор')) {
                await func(user)
            }
        } catch (err) {
            console.error(err)
            res.status(401);
            res.end(JSON.stringify(err.message))
        }
    } )(req, res)
}

const verifydrealizator = async (req, res, func) => {
    await passport.authenticate('jwt', async function (err, user) {
        try{
            if (user&&user.status==='active'&&(user.role==='admin'||user.role==='manager'||user.role==='реализатор')) {
                await func(user)
            }
        } catch (err) {
            console.error(err)
            res.status(401);
            res.end(JSON.stringify(err.message))
        }
    } )(req, res)
}

const verifydzavsklad = async (req, res, func) => {
    await passport.authenticate('jwt', async function (err, user) {
        try{
            if (user&&user.status==='active'&&(user.role==='admin'||user.role==='manager'||user.role==='завсклада')) {
                await func()
            }
        } catch (err) {
            console.error(err)
            res.status(401);
            res.end(JSON.stringify(err.message))
        }
    } )(req, res)
}

const verifydeuser = async (req, res, func) => {
    await passport.authenticate('jwt', async function (err, user) {
        try{
            if (user&&user.status==='active') {
                await func()
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

const signinuser = (req, res) => {
    passport.authenticate('local', async function (err, user) {
        try{
            if (user&&user.status==='active') {
                const payload = {
                    id: user._id,
                    email: user.email,
                    status: user.status,
                    role: user.role
                };
                const token = await jwt.sign(payload, jwtsecret); //здесь создается JWT
                res.status(200);
                res.end(token);
            } else {
                res.status(401);
                res.end('Login failed',401)
            }
        } catch (err) {
            console.error(err)
            res.status(401);
            res.end('email not be unique')
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

module.exports.verifydrole = verifydrole;
module.exports.getstatus = getstatus;
module.exports.verifydadmin = verifydadmin;
module.exports.start = start;
module.exports.verifydeuser = verifydeuser;
module.exports.signinuser = signinuser;
module.exports.verifydorganizator = verifydorganizator;
module.exports.verifydrealizator = verifydrealizator;
module.exports.verifydzavsklad = verifydzavsklad;