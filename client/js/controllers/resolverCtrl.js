function ResolverCtrl($rootScope, $location, auth, $routeParams){
    auth.user(
        function (user){
            if(user != null) {
                $rootScope.redirectUser();
            } else {
                console.log(user);
                var res = $routeParams.res;
                console.log(res);
                if(user.role == 'SUPERVISOR') {
                    console.log('SU');
//                    $location.url('/client/supervisor');
                } else {
                    console.log('ST');
//                    $location.url('/client/student');
                }
            }
        }
    );
}