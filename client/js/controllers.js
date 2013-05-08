function LoginCtrl($scope, $rootScope, $location, $http, auth) {
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
}