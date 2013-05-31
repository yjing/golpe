app.factory('users_db',function (database) {
    return new function () {
        this.insertUser = function(user){
            user.status = 'complete';
            delete user['Supervisor'];
            return database.insert('users', user['id'], user);
        };
    };
}).service('users', function($resource){

});
