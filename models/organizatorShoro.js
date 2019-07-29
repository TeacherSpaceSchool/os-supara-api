const mongoose = require('mongoose');

const OrganizatorShoroSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserShoro'
    },
    guidRegion: {
        type: String,
        required: true,
    },
    guid: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const OrganizatorShoro = mongoose.model('OrganizatorShoro', OrganizatorShoroSchema);

/*OrganizatorShoro.collection.dropIndex('name_1', function(err, result) {
    if (err) {
        console.log('Error in dropping index!', err);
    }
});*/

module.exports = OrganizatorShoro;