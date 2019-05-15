var mongoose = require('mongoose');
var connect = function() {
        mongoose.connect('mongodb://localhost:27017/',
        //{user: 'newmed', pass: 'nKzJDb3sFqvbxfCcqUB0pw6LwJAKIpKLkMzZ0SEx4TGGnbb2rhFlPPF82qd4eIvR996ZbSu1w8XvMN2SG4ntXw=='},
        function (err) {

            if (err) {
                console.log('error');
                throw err;
            }
            console.log('Successfully connected');

        });
};
module.exports.connect = connect;