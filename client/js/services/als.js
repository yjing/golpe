app.factory('als_db',function (database, comments_db, media_db) {
    return new function () {
        this.insertAls = function (d, mode) {
            var ret = [];
            if (angular.isArray(d)) {
                for (var i = 0; i < d.length; i++) {
                    var al = d[i]['ActivityLog'];
                    ret.push(this.insertAl(al, mode));
                }
            }
            return ret;
        }

        this.insertAl = function (al, mode) {
            var complete = false;

            // MANAGE ASSOCIATIONS
            var comments;
            if(angular.isDefined(al['Comment'])) {
                if(angular.isDefined(al['Comment']['content'])) {
                    complete = true;
                }
                comments = comments_db.insertComments(al['Comment']);
                delete al['Comment'];
            }
            var media;
            if(angular.isDefined(al['Media'])) {
                if(angular.isDefined(al['Media']['filename'])) {
                    complete = true;
                }
                media = media_db.insertMedia(al['Media']);
                delete al['Media'];
            }
            delete al['User'];

            // MANAGE MODES
            var existing = database.get('als', al['id'], 0);
            if (angular.isDefined(existing)) {
                var modes = existing.modes;
                if (modes.indexOf(mode) < 0) {
                    modes.push(mode);
                }
                al.modes = modes;
            } else {
                al.modes = [mode];
            }

            // SET COMPLETENESS
            if(complete) {
                al.status = 'complete';
            } else {
                al.status = 'partial';
            }

            // INSERT IN DB
            al = database.insert('als', al['id'], al);

            // ADD EVENTUAL ASSOCIATION TO RETURNED DATA
            if(angular.isDefined(comments)) {
                al.comments = comments;
            }
            if(angular.isDefined(media)) {
                al.media = media;
            }
            return al;
        }
    }
}).service('als', function ($rootScope, als_db, database, resources, busy) {

        var present_modes = [];

        this.all = function (reload, mode, success, error) {

            if(!reload && present_modes.indexOf(mode) >= 0) {
                var als = database.select('als', [
                    { field:'modes', value:mode }
                ], 0);

                if (angular.isDefined(success)) {
                    success(als);
                }
                return;
            }

            busy.busy(true);
            resources.Als.all(
                { mode:mode },
                function (d, h) {
                    busy.busy(false);

                    d = als_db.insertAls(d, mode);
                    if(present_modes.indexOf(mode) < 0) {
                        present_modes.push(mode);
                    }

                    if (angular.isDefined(success)) {
                        success(d, h);
                    }
                },
                function (e) {
                    busy.busy(false);
                    if (!$rootScope.error(e) && angular.isDefined(error)) {
                        error(e);
                    }
                }
            );
        }
    });
