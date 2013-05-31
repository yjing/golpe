function LoginCtrl($scope, $rootScope, $location, auth){

    auth.user(
        function (user){
            if(user != null) {
                $rootScope.user = user;
                $scope.redirectUser(user);
            }
        }
    );

    $scope.username = "s.susini";
    $scope.password = "30071980";

    $scope.login = function(){
        auth.login($scope.username, $scope.password,
            function(user){
                if(user != null) {
                    $rootScope.user = user;
                    $scope.redirectUser(user);
                } else {
                    $scope.login_message = "Error";
                }
            }
        );
    }

    $scope.redirectUser = function (user) {
        var role = user.role;
        switch (role) {
            case 'STUDENT':
                $location.url('/client/student');
                break;
            case 'SUPERVISOR':
                $location.url('/client/supervisor');
                break;
            case 'ADMIN':
                $location.url('/client/users');
                break;
        }
    };

    // TOP BAR
    $rootScope.top_bar = {
        page_title: 'Login',
        main_menu_items: [
            { type: 'item', label: 'Help', icon: 'icon-question-sign', func: $rootScope.help },
            { type: 'item', label: 'Info', icon: 'icon-info-sign', func: $rootScope.info }
        ]
    };
}