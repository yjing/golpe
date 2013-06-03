app.factory('users_db',function (database) {
    return new function () {
        this.insertUsers = function (users, options) {
            var opt = angular.isObject(options);
            if(users instanceof Array) {
                for (var i = 0; i < users.length; i++) {
                    if(opt) {
                        angular.forEach(options, function(v, k){
                            console.log(k);
                            console.log(v);
                        }, this);
                    }
                    this.insertUser(users[i]);
                }
            }
        };
        this.insertUser = function(user){
            delete user['Supervisor'];
            return database.insert('users', user['id'], user);
        };
    };
}).service('users', function($resource){

});
