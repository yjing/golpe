function LoginCtrl($scope, $rootScope, $location, $resource, $http, auth) {
    // TMP CREDENTIALS
    $scope.username = "s.susini";
    $scope.password = "30071980";

    // MENUS and ACTIVITY BAR
    $scope.busy_class = "";
    $scope.busy_monitor = 0;
    $scope.busy = function(busy) {
        if(busy) {
            $scope.busy_monitor++;
            $scope.busy_class = "busy";
        } else {
            $scope.busy_monitor--;
            if($scope.busy_monitor <= 0) {
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

    // CONTROLLER BL
    var User = $resource('/users/user');
    $scope.busy(true);
    $rootScope.user = User.get({},
        function (data) {
            console.log($scope);
            $scope.busy(false);
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
                $scope.busy(false);
            }
        },
        function (data) {
            console.log($scope);
            $scope.busy(false);
        }
    );
}