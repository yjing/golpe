function ResolverCtrl($location, $routeParams){
    console.log('RESOLVER1');
    auth.user(
        function (user){
            if(user != null) {
                console.log('RESOLVER2');
                $rootScope.redirectUser();
            } else {
                console.log('RESOLVER3');
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