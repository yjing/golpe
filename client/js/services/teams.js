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
//                users_db.insertUsers(team['Student'], { team_id:team.id });
                team.status = 'complete';
                delete team['Student'];
            }

            database.insert('teams', team['id'], team);
        };
    };
}).service('teams', function ($rootScope, busy, resources, teams_db, database) {
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
