app.service('als', function($rootScope, resources, busy){
    this.all = function(mode, success, error){
        busy.busy(true);
        resources.Als.all(
            { mode : mode},
            function (d, h) {
                busy.busy(false);
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
});
