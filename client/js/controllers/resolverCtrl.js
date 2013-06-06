function ResolverCtrl($rootScope, $location, auth, $routeParams){
    auth.user(
        function (user){
            if(angular.isUndefined(user) || user == null) {
                $rootScope.redirectAfterLogin = $location.url();
                $location.url('/client/login');
            }

            var url = '/client/'
            if($rootScope.user.role == 'STUDENT') {
                url += 'student/'
            } else if($rootScope.user.role == 'SUPERVISOR') {
                url += 'supervisor/'
            } else {
                $location.url('/client/projects');
                return;
            }

            var res = $routeParams.res;
            var res_id = res.lastIndexOf('ActivityLog:') + 'ActivityLog:'.length;
            res_id = res.substr(res_id);
            $location.url(url + res_id);

        }, true
    );
}