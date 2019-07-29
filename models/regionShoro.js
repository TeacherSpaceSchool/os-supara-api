const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const RegionShoroSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    guid: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

RegionShoroSchema.plugin(uniqueValidator);

const RegionShoro = mongoose.model('RegionShoro', RegionShoroSchema);

/*RegionShoro.collection.dropIndex('name_1', function(err, result) {
    if (err) {
        console.log('Error in dropping index!', err);
    }
});*/

module.exports = RegionShoro;