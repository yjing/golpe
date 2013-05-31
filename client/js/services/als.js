app.service('als_db',function (database) {

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

}).factory('als', function ($rootScope, als_db, resources, busy) {
    this.all = function (mode, success, error) {
        busy.busy(true);
        resources.Als.all(
            { mode:mode},
            function (d, h) {
                busy.busy(false);

                d = als_db.insertAls(d, mode);

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
    return this;
});
