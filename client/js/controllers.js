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

    $rootScope.busy(true);
    $rootScope.user = auth.user();
    $rootScope.user.$then(function(){
        $rootScope.busy(false);
        $scope.redirectUser();
    });

}

function AdminCtrl($scope, $rootScope, $location, $resource, auth) {
    $scope.page_title = "Users";
    $scope.users = [{"test":"Test"}];

    if($rootScope.user == null || !$rootScope.user['logged']) {
        $rootScope.busy(true);
        $rootScope.user = auth.user();
        $rootScope.user.$then(function(){
            $rootScope.busy(false);
            if(!$rootScope.user['logged']) {
                $location.url('/client/login');
            } else {
                $scope.main();
            }
        });
    }

    $scope.Users = $resource('/users/', {}, {
        all: {
            method: 'GET',
            isArray: true
        }
    });
    $scope.main = function() {
        $rootScope.toggleTitleMenu();
        $rootScope.busy(true);
        $scope.users = $scope.Users.all();
        $scope.users.$then(function(){
            $rootScope.busy(false);
        });
    }

}