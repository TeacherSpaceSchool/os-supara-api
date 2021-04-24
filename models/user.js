const mongoose = require('mongoose');
const crypto = require('crypto');
const uniqueValidator = require('mongoose-unique-validator');

const userOsSuparaSchema = mongoose.Schema({
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
    pinCode: String,
    addApplication: Boolean,
}, {
    timestamps: true
});

userOsSuparaSchema.virtual('password')
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

userOsSuparaSchema.methods.checkPassword = function (password) {
    if (!password) return false;
    if (!this.passwordHash) return false;
    return crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1') == this.passwordHash;
};

userOsSuparaSchema.plugin(uniqueValidator);

userOsSuparaSchema.index({GUID: 1})
userOsSuparaSchema.index({del: 1})
userOsSuparaSchema.index({name: 1})
userOsSuparaSchema.index({login: 1})
userOsSuparaSchema.index({role: 1})

const UserOsSupara = mongoose.model('UserOsSupara', userOsSuparaSchema);
/*
UserOsSupara.collection.dropIndex('phone_1', function(err, result) {
    if (err) {
        console.log('Error in dropping index!', err);
    }
});*/

module.exports = UserOsSupara;