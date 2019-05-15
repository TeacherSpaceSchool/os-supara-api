const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const BlogShoroSchema = mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    text: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

BlogShoroSchema.plugin(uniqueValidator);

const BlogShoro = mongoose.model('BlogShoro', BlogShoroSchema);

module.exports = BlogShoro;