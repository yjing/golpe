function LoginCtrl($scope, $rootScope, $location, $resource, $http, auth) {
    // TMP CREDENTIALS
    $scope.username = "s.susini";
    $scope.password = "30071980";

    var User = $resource('/users/2');
    $rootScope.user = User.get({},
        function (data) {
            console.log("SUCCESS");
            console.log(data);
        },
        function (a, b, c, d, e) {
            console.log("ERROR");
            console.log(a);
            console.log(b);
            console.log(c);
            console.log(d);
            console.log(e);
        }
    );

    // MENUS
    $scope.mainmenu_open = "";
    $scope.toggleMenu = function() {
        if($scope.mainmenu_open.length == 0) {
            $scope.mainmenu_open = "open";
        } else {
            $scope.mainmenu_open = "";
        }
    }
    $scope.titlemenu_open = "";
    $scope.toggleTitleMenu = function() {
        if($scope.titlemenu_open.length == 0) {
            $scope.titlemenu_open = "open";
        } else {
            $scope.titlemenu_open = "";
        }
    }
}