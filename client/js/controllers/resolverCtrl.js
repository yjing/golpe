function ResolverCtrl($rootScope, $location, auth, $routeParams){
    auth.user(
        function (user){
            if(angular.isUndefined(user) || user == null) {
                $rootScope.redirectAfterLogin = $location.url();
                $location.url('/client/login');
            }

            var res = $routeParams.res;
            console.log(res);
            if(user.User.role == 'SUPERVISOR') {
                console.log('SU');
//                    $location.url('/client/supervisor');
            } else {
                console.log('ST');
//                    $location.url('/client/student');
            }
        }, true
    );
}