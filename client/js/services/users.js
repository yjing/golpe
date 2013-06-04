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
            if(angular.isDefined(user['Profile'])) {
                user['profile'] = user['Profile'];
                user.status = 'complete';
                delete user['Profile'];
            }
            if(angular.isDefined(user['Team'])) {
                if(user['Team'] != null && user['Team'].length > 0) {
                    user['team_id'] = user['Team'][0].id;
                }
                user.status = 'complete';
                delete user['Team'];
            }
            if(angular.isDefined(user['Supervisor'])) {
                if(user['Supervisor'] != null) {
                    user['supervisor_id'] = user['Supervisor'].id;
                }
                user.status = 'complete';
                delete user['Supervisor'];
            }
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
                    loaded = true;

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

        this.load = function(id, success, error){
            var existing = database.select('users', [ {field:'id',value:id} ], 3)[0];
            if(angular.isDefined(existing) && existing != null && existing.status == 'complete') {
                if(angular.isDefined(success)) {
                    success(existing);
                    return;
                }
            }

            busy.busy(true);
            resources.Users.load(
                {'id':id}, //PARAMS
                {}, //DATA
                function (d, h) {
                    busy.busy(false);

                    users_db.insertUser(d['User']);

                    if(angular.isDefined(success)) {
                        success(d, h);
                    }
                },
                function (e) {
                    busy.busy(false);
                    if(!$rootScope.handleError(e) && angular.isDefined(error)) {
                        error(e);
                    }
                }
            );
        }

    });
