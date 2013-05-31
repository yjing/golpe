app.service('als', function($rootScope, database, resources, busy){

    this.all = function(mode, success, error){
        busy.busy(true);
        resources.Als.all(
            { mode : mode},
            function (d, h) {
                busy.busy(false);

                d = insertAls(d);

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

    var insertAls = function(d) {
        var ret = [];
        if(angular.isArray(d)) {
            for (var i = 0; i < d.length; i++) {
                var al = d[i]['ActivityLog'];
                ret.push( insertAl(al) );
            }
        }
        return ret;
    }

    var insertAl = function(al) {
        delete al['Comment'];
        delete al['Media'];
        delete al['User'];

        return database.insert('als', al['id'], al);
    }
});
