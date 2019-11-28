var mongoose = require('mongoose');
var connect = function() {
        mongoose.connect('mongodb://localhost:27017/admin', {
                useCreateIndex: true,
                useNewUrlParser: true
            },
        function (err) {

            if (err) {
                console.log('error');
                throw err;
            }
            console.log('Successfully connected');

        });
};
module.exports.connect = connect;