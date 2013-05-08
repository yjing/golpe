function LoginCtrl($scope, $rootScope, $location, $http, auth) {
    // TMP CREDENTIALS
    $scope.username = "s.susini";
    $scope.password = "30071980";

    $scope.login = function() {
        $rootScope.busy(true);
        $rootScope.user = auth.auth($scope.username, $scope.password);
        $rootScope.user.then(
            function(){
                console.log("SUCCESS");
                console.log($rootScope.user);
            },
            function(){
                console.log("ERROR");
                console.log($rootScope.user);
            }
        )
    }
}