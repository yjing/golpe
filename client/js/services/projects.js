app.factory('projects_db',function (database, teams_db) {
    return new function () {
        this.insertProjects = function (projects) {
            if(angular.isArray(projects)) {
                for (var i = 0; i < projects.length; i++) {
                    this.insertProject(projects[i]['Project']);
                }
            }
        };
        this.insertProject = function (project) {
            if(angular.isDefined(project['Team'])) {
                if(project['Team'] instanceof Array && project['Team'].length > 0) {
                    teams_db.insertTeams(project['Team']);
                }
                project.status = 'complete';
                delete project['Team'];
            }

            database.insert('projects', project['id'], project);
        };
    };
}).service('projects', function ($rootScope, busy, resources, projects_db, database) {

        var loaded = false;

        this.all = function (reload, success, error) {
            if(!reload && loaded) {
                if(angular.isDefined(success)) {
                    success(database.select('projects',[], 3));
                }
                return;
            }

            busy.busy(true);
            resources.Projects.all(
                {}, //PARAMS
                {}, //DATA
                function (d, h) {
                    busy.busy(false);
                    loaded = true;

                    projects_db.insertProjects(d);

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
        };

        this.load = function(id, success, error){
            var existing = database.select('projects', [ {field:'id', value:id} ], 3)[0];
            if(angular.isDefined(existing) && existing != null && existing.status == 'complete' && angular.isDefined(success)) {
                success(existing);
                return;
            }

            busy.busy(true);
            resources.Projects.load(
                { 'id':id }, //PARAMS
                {}, //DATA
                function (d, h) {
                    busy.busy(false);
                    projects_db.insertProject(d['Project']);

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

        this.save = function(project, success, error){
            var params = {};
            if(angular.isDefined(project.id)) {
                params.id = project.id;
            }

            busy.busy(true);
            resources.Projects.save(
                params, //PARAMS
                {Project: project}, //DATA
                function (d, h) {
                    busy.busy(false);

                    projects_db.insertProject(d['Project']);

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
