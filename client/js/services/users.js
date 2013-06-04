app.factory('users_db',function (database) {
    return new function () {
        this.insertUsers = function (users, options) {
            var opt = angular.isObject(options);
            if (users instanceof Array) {
                for (var i = 0; i < users.length; i++) {
                    if(angular.isDefined(users[i]['User'])) {
                        users[i] = users[i]['User'];
                    }
                    if (opt) {
                        angular.forEach(options, function (v, k) {
                            users[i][k] = v;
                        }, this);
                    }
                    this.insertUser(users[i]);
                }
            }
        };
        this.insertUser = function (user) {
            delete user['Supervisor'];
            console.log(user);
            return database.insert('users', user['id'], user);
        };
    };
}).service('users', function ($rootScope, busy, resources, users_db, database) {

        var loaded = false;

        this.all = function (reload, success, error) {
            if(!reload && loaded) {
                if(angular.isDefined(success)) {
                    success(database.select('users',[], 3));
                }
                return;
            }

            busy.busy(true);
            resources.Users.all(
                {}, //PARAMS
                {}, //DATA
                function (d, h) {
                    busy.busy(false);

                    users_db.insertUsers(d);
                    console.log(database.select('users', [
                        {field:'role', value:'STUDENT'}
                    ], 3));

                    if (angular.isDefined(success)) {
                        success(d, h);
                    }
                },
                function (e) {
                    busy.busy(false);
                    if (!$rootScope.handleError(e) && angular.isDefined(error)) {
                        error(e);
                    }
                }
            );
        }
    });
