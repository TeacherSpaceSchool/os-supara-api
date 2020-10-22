const mongoose = require('mongoose');
const crypto = require('crypto');
const uniqueValidator = require('mongoose-unique-validator');

const userCantSytSchema = mongoose.Schema({
    login: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    del: String,
    role: String,
    status: String,
    phone: String,
    passwordHash: String,
    GUID: String,
    salt: String,
}, {
    timestamps: true
});

userCantSytSchema.virtual('password')
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

userCantSytSchema.methods.checkPassword = function (password) {
    if (!password) return false;
    if (!this.passwordHash) return false;
    return crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1') == this.passwordHash;
};

userCantSytSchema.plugin(uniqueValidator);

userCantSytSchema.index({GUID: 1})
userCantSytSchema.index({del: 1})
userCantSytSchema.index({name: 1})
userCantSytSchema.index({login: 1})
userCantSytSchema.index({role: 1})

const UserCantSyt = mongoose.model('UserCantSyt', userCantSytSchema);
/*
UserCantSyt.collection.dropIndex('phone_1', function(err, result) {
    if (err) {
        console.log('Error in dropping index!', err);
    }
});*/

module.exports = UserCantSyt;