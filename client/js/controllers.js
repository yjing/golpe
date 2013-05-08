function LoginCtrl($scope, $rootScope, $location, $resource, $http, auth) {
    // TMP CREDENTIALS
    $scope.username = "s.susini";
    $scope.password = "30071980";

    $scope.login = function() {
        $rootScope.busy(true);
        auth.credentials($scope.username, $scope.password);
        auth.auth(function(result){
            console.log(result);
        })
    }

    // CONTROLLER BL
    var User = $resource('/users/user');
    $rootScope.busy(true);
    $rootScope.user = User.get({},
        function (data) {
            $rootScope.busy(false);
            if(data['logged']) {
                switch (data['User']['role']) {
                    case 'STUDENT':
                        //GO TO STUDENT'S HOME
                        $location.url("/client/al");
                        break;
                    case 'SUPERVISOR':
                        //GO TO SUPERVISOR'S HOME
                        break;
                    case 'ADMIN':
                        //GO TO ADMIN'S HOME
                        break;
                }
            } else {
                $rootScope.busy(false);
            }
        },
        function (data) {
            $rootScope.busy(false);
        }
    );
}