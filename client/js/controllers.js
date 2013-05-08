function LoginCtrl($scope, $rootScope, $location, auth) {
    // TMP CREDENTIALS
    $scope.username = "y.jing";
    $scope.password = "30071980";

    $scope.login = function() {
        $rootScope.busy(true);
        $rootScope.user = auth.auth($scope.username, $scope.password);
        $rootScope.user.$then(
            function(){
                console.log($rootScope.user);
                $rootScope.busy(false);
                if( $rootScope.user['logged'] ) {
                    $scope.redirectUser();
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
        $rootScope.toggleMenu();
        $rootScope.busy(true);

        $rootScope.user = auth.logout();
        $rootScope.user.$then(
            function(){
                $rootScope.busy(false);
            },
            function(){
                $rootScope.busy(false);
            }
        )
    }

    $scope.redirectUser = function() {
        if($rootScope.user['logged']) {
            switch ($rootScope.user['User']['role']) {
                case 'STUDENT':
                    $location.url('/client/student');
                    break;
                case 'SUPERVISOR':
                    $location.url('/client/supervisor');
                    break;
                case 'ADMIN':
                    $location.url('/client/admin');
                    break;
            }
        }
    }
}

function AdminCtrl($scope, $rootScope, $location, auth) {
    console.log("ADMIN");
    $scope.admin = {
        page_title: "Users",
        admin: [
            {test: "test"}
        ]
    };

}