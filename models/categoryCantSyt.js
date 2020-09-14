const mongoose = require('mongoose');

const CategoryCantSytSchema = mongoose.Schema({
    name: String,
    del: String,
    GUID: String,
    suppliers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCantSyt'
    }],
    term: Number
}, {
    timestamps: true
});


const CategoryCantSyt = mongoose.model('CategoryCantSyt', CategoryCantSytSchema);

module.exports = CategoryCantSyt;