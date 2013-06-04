app.factory('teams_db',function (database, users_db) {
    return new function () {
        this.insertTeams = function (teams) {
            if(angular.isArray(teams)) {
                for (var i = 0; i < teams.length; i++) {
                    this.insertTeam(teams[i]);
                }
            }
        };
        this.insertTeam = function (team) {
            if(angular.isDefined(team['Student'])) {
                team.status = 'complete';
                delete team['Student'];
            }
            database.insert('teams', team['id'], team);
        };
        this.delete = function (id) {
            var users = database.select('users', [{field:'team_id',value:id}], 0);
            for (var i = 0; i < users.length; i++) {
                delete users[i].team_id;
                users_db.insertUser(users[i]);
            }
            database.delete('teams', t_id);
        };
    };
}).service('teams', function ($rootScope, busy, resources, teams_db, database) {
        this.save = function(team, success, error){
            var params = {};
            if(angular.isDefined(team.id)) {
                params.id = team.id;
            }

            busy.busy(true);
            resources.Teams.save(
                params, //PARAMS
                { Team: team }, //DATA
                function (d, h) {
                    busy.busy(false);

                    teams_db.insertTeam(d['Team']);

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

        this.delete = function(t_id, success, error){
            busy.busy(true);
            resources.Teams.delete(
                { id:t_id }, //PARAMS
                {}, //DATA
                function (d, h) {
                    busy.busy(false);

                    teams_db.delete(id);

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

        this.addMember = function(t_id, u_id, success, error){
            busy.busy(true);
            resources.Teams.addMember(
                {tid:t_id, uid:u_id}, //PARAMS
                {}, //DATA
                function (d, h) {
                    busy.busy(false);

                    var user = database.select('users',[ {field:'id', value:u_id} ],0)[0];
                    if(angular.isDefined(user) && user != null) {
                        user['team_id'] = t_id;
                    }
                    database.insert('users', user['id'], user);

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

        this.removeMember = function(t_id, u_id, success, error){
            busy.busy(true);
            resources.Teams.removeMember(
                {tid:t_id, uid:u_id}, //PARAMS
                {}, //DATA
                function (d, h) {
                    busy.busy(false);

                    var user = database.select('users',[ {field:'id', value:u_id} ],0)[0];
                    if(angular.isDefined(user) && user != null) {
                        delete user['team_id'];
                    }
                    database.insert('users', user['id'], user);

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
