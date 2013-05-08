function LoginCtrl($scope, $rootScope, $location, $http, auth) {
    // TMP CREDENTIALS
    $scope.username = "s.susini";
    $scope.password = "30071980";

    $scope.login = function() {
        $rootScope.busy(true);
        $rootScope.user = auth.auth($scope.username, $scope.password);
        $rootScope.user.$then(
            function(){
                console.log($rootScope.user);
                $rootScope.busy(false);
                if( $rootScope.user['logged'] ) {

                } else {
                    $scope.login_message = "Login failed";
                }
            },
            function(){
                $rootScope.busy(false);
                $scope.login_message = "Login failed";
            }
        )
    }

    $scope.logout = function() {
        $rootScope.busy(true);
        $rootScope.user = auth.logout();
        $rootScope.user.$then(
            function(){
                $rootScope.busy(false);
//                if( $rootScope.user['logged'] ) {
//
//                } else {
//                    $scope.login_message = "Login failed";
//                }
            },
            function(){
                $rootScope.busy(false);
//                $scope.login_message = "Login failed";
            }
        )
    }
}