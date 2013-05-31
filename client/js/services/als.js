app.service('als', function($rootScope, resources, busy){
    this.all = function(success, error){
        busy.busy(true);
        resources.Als.all(
            { mode : 'all'},
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
});
