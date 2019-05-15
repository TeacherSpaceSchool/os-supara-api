const mongoose = require('mongoose');
const crypto = require('crypto');
const uniqueValidator = require('mongoose-unique-validator');



const userShoro1Schema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: String,
    status: String,
    passwordHash: String,
    salt: String,
}, {
    timestamps: true
});

userShoro1Schema.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        if (password) {
            this.salt = crypto.randomBytes(128).toString('base64');
            this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1');
        } else {
            this.salt = undefined;
            this.passwordHash = undefined;
        }
    })
    .get(function () {
        return this._plainPassword;
    });

userShoro1Schema.methods.checkPassword = function (password) {
    if (!password) return false;
    if (!this.passwordHash) return false;
    return crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1') == this.passwordHash;
};

userShoro1Schema.plugin(uniqueValidator);

const UserShoro1 = mongoose.model('UserShoro1', userShoro1Schema);

module.exports = UserShoro1;