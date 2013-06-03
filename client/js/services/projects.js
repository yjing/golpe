app.factory('projects_db',function (database) {
    return new function () {
        this.insertProjects = function (projects) {
            if(angular.isArray(projects)) {
                for (var i = 0; i < projects.length; i++) {
                    this.insertComment(projects[i]);
                }
            }
        };
        this.insertProject = function (project) {
//            if(angular.isDefined(project['Media'])) {
//                if(angular.isArray(project['Media']) && project['Media'].length > 0) {
//                    var media = media_db.insertMedia(project['Media'], 'comment', project['id']);
//                    project.media = media;
//                }
                delete project['Team'];
//            }

            database.insert('project', project['id'], project);
        };
    };
}).service('projects', function ($rootScope, busy, resources, projects_db) {

        this.all = function (success, error) {
            busy.busy(true);
            resources.Projects.all(
                {}, //PARAMS
                {}, //DATA
                function (d, h) {
                    busy.busy(false);

                    projects_db.insertProject(d);

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

    });
