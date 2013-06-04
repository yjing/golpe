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
//
//        var loaded = false;
//
//        this.all = function (reload, success, error) {
//            if(!reload && loaded) {
//                if(angular.isDefined(success)) {
//                    success(database.select('projects',[], 3));
//                }
//                return;
//            }
//
//            busy.busy(true);
//            resources.Projects.all(
//                {}, //PARAMS
//                {}, //DATA
//                function (d, h) {
//                    busy.busy(false);
//                    loaded = true;
//
//                    projects_db.insertProjects(d);
//
//                    if (angular.isDefined(success)) {
//                        success(d, h);
//                    }
//                },
//                function (e) {
//                    busy.busy(false);
//                    if (!$rootScope.handleError(e) && angular.isDefined(error)) {
//                        error(e);
//                    }
//                }
//            );
//        };
//
//        this.load = function(id, success, error){
//            var existing = database.select('projects', [ {field:'id', value:id} ], 3)[0];
//            if(angular.isDefined(existing) && existing != null && existing.status == 'complete' && angular.isDefined(success)) {
//                success(existing);
//                return;
//            }
//
//            busy.busy(true);
//            resources.Projects.load(
//                { 'id':id }, //PARAMS
//                {}, //DATA
//                function (d, h) {
//                    busy.busy(false);
//
//                    projects_db.insertProject(d['Project']);
//
//                    if(angular.isDefined(success)) {
//                        success(d, h);
//                    }
//                },
//                function (e) {
//                    busy.busy(false);
//                    if(!$rootScope.handleError(e) && angular.isDefined(error)) {
//                        error(e);
//                    }
//                }
//            );
//        }

    });
