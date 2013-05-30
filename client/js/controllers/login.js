function LoginCtrl($scope, $rootScope, $location, auth){

    auth.user(
        function (user){
            if(user != null) {
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
                    $scope.redirectUser(user);
                } else {
                    $scope.login_message = "Error";
                }
            }
        );
    }

    // TOP BAR
    $rootScope.top_bar = {
        page_title: 'Login',
        main_menu_items: [
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };
}