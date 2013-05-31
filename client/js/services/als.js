//app.service('resources', function(resources, busy){
//    this.all = function(success, error){
//        busy.busy(true);
//        resources.all(
//            function (d, h) {
//                busy.busy(false);
//                console.log(d);
//                if(angular.isDefined(success)) {
//                    success(d, h);
//                }
//            },
//            function (e) {
//                busy.busy(false);
//                if(angular.isDefined(error)) {
//                    error(e);
//                }
//            }
//        );
//    }
//});
