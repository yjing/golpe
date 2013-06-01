app.factory('als_db',function (database, comments_db, media_db, users_db) {
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
                if(angular.isArray(al['Comment']) && al['Comment'].length > 0) {
                    comments = comments_db.insertComments(al['Comment'], al['id']);
                    if(angular.isDefined(comments[0]['content'])) {
                        complete = true;
                    }
                }
                delete al['Comment'];
            }
            var media;
            if(angular.isDefined(al['Media'])) {
                if(angular.isArray(al['Media']) && al['Media'].length > 0) {
                    media = media_db.insertMedia(al['Media'], 'al', al['id']);
                    if(angular.isDefined(media[0]['filename'])) {
                        complete = true;
                    }
                }
                delete al['Media'];
            }
            var user;
            if(angular.isDefined(al['User'])) {
                user = users_db.insertUser(al['User']);
                delete al['User'];
            }

            // MANAGE MODES
            if(angular.isDefined(mode)) {
                var existing = database.get('als', al['id'], 0);
                if (angular.isDefined(existing)) {
                    var modes = existing.modes;
                    if (angular.isDefined(modes) && modes.indexOf(mode) < 0) {
                        modes.push(mode);
                    } else {
                        modes = [mode];
                    }
                    al.modes = modes;
                } else {
                    al.modes = [mode];
                }
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
            if(angular.isDefined(user)) {
                al.user = user;
            }
            return al;
        }
    };
}).service('als', function ($rootScope, als_db, database, resources, busy) {

        var present_modes = [];

        this.all = function (reload, mode, success, error) {

            if(!reload && present_modes.indexOf(mode) >= 0) {
                var als = database.select('als', [
                    { field:'modes', value:mode }
                ], 3);

                if (angular.isDefined(success) && angular.isFunction(success)) {
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

                    if (angular.isDefined(success) && angular.isFunction(success)) {
                        success(d, h);
                    }
                },
                function (e) {
                    busy.busy(false);
                    if (!$rootScope.handleError(e) && angular.isDefined(error) &&  angular.isFunction(error) ) {
                        error(e);
                    }
                }
            );
        }

        this.get = function(id, success, error){
            busy.busy(true);
            resources.Als.get(
                { 'id':id }, //PARAMS
                {}, //DATA
                function (d, h) {
                    busy.busy(false);

                    var al = als_db.insertAl(d['ActivityLog']);

                    if(angular.isDefined(success) && angular.isFunction(success)) {
                        success(al, h);
                    }
                },
                function (e) {
                    busy.busy(false);
                    if(!$rootScope.handleError(e) && angular.isFunction(error)) {
                        error(e);
                    }
                }
            );
        }

        this.save = function(data, success, error){
            var params = {};
            if(angular.isDefined(data.id)) {
                params.id = data.id;
            }

            delete data['created'];
            delete data['modified'];

            busy.busy(true);
            resources.Als.save(
                params, //PARAMS
                data, //DATA
                function (d, h) {
                    busy.busy(false);

                    als_db.insertAl(d['ActivityLog']);

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

        this.modes = function () {
            this.Als.modes = function(success, error){
                busy.busy(true);
                resources.Als.modes(
                    {}, //PARAMS
                    {}, //DATA
                    function (d, h) {
                        busy.busy(false);
                        console.log(d);
                        if(angular.isDefined(success)) {
                            success(d, h);
                        }
                    },
                    function (e) {
                        busy.busy(false);
                        if(!$rootScope.error(e) && angular.isDefined(error)) {
                            error(e);
                        }
                    }
                );
            }
        };

    });
