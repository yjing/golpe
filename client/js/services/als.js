app.factory('als_db',function (database) {
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
            delete al['Comment'];
            delete al['Media'];
            delete al['User'];

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
            return database.insert('als', al['id'], al);
        }
    }
}).service('als', function ($rootScope, als_db, database, resources, busy) {

        var present_modes = [];

        this.all = function (reload, mode, success, error) {

            if(!reload && present_modes.indexOf(mode) > 0) {
                var als = database.select('als', [
                    { field:'mode', value:mode }
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
