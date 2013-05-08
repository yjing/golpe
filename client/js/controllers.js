function LoginCtrl($scope, $rootScope, $location, $resource, $http, auth) {
    // TMP CREDENTIALS
    $scope.username = "s.susini";
    $scope.password = "30071980";

    var User = $resource('/users/user');
    $scope.busy(true);
    $rootScope.user = User.get({},
        function (data) {

            if(data['logged']) {
                switch (data['User']['role']) {
                    case 'STUDENT':
                        //GO TO STUDENT'S HOME
                        break;
                    case 'SUPERVISOR':
                        //GO TO SUPERVISOR'S HOME
                        break;
                    case 'ADMIN':
                        //GO TO ADMIN'S HOME
                        break;
                }
            } else {

            }
        },
        function (data) {

        }
    );

    // MENUS and ACTIVITY BAR
    $scope.busy_class = "";
    $scope.busy = 0;
    $scope.busy = function(busy) {
        if(busy) {
            $scope.busy++;
            $scope.busy_class = "busy";
        } else {
            $scope.busy--;
            if($scope.busy <= 0) {
                $scope.busy = 0;
                $scope.busy_class = "";
            }
        }
    }

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