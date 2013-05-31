app.factory('users_db',function (database) {
    return new function () {
        this.insertUser = function(user){
            delete user['Supervisor'];
            return database.insert('users', user['id'], user);
        };
    };
}).service('users', function($resource){

});
