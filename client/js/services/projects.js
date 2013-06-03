app.factory('projects_db',function (database) {
    return new function () {
        this.insertPeojects = function (projects) {
//            var ret = [];
//            if(angular.isArray(comments)) {
//                for (var i = 0; i < comments.length; i++) {
//                    ret.push(this.insertComment(comments[i], target_id));
//                }
//            }
//            return ret;
        };
        this.insertProject = function (project) {
//            if(angular.isDefined(comment['Media'])) {
//                if(angular.isArray(comment['Media']) && comment['Media'].length > 0) {
//                    var media = media_db.insertMedia(comment['Media'], 'comment', comment['id']);
//                    comment.media = media;
//                }
//                delete comment['Media'];
//            }
//            if(angular.isDefined(comment['User'])) {
//                var user = users_db.insertUser(comment['User']);
//                comment.user = user;
//                delete comment['User'];
//            }
//
//            comment.activity_log_id = target_id;
//            return database.insert('comments', comment['id'], comment);
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

                    console.log(d);

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
