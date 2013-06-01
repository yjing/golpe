function LoginCtrl($scope, $rootScope, $location, auth){

    auth.user(
        function (user){
            if(user != null) {
                $rootScope.user = user['User'];
                $rootScope.redirectUser();
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
                    $scope.redirectUser();
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
            { type: 'item', label: 'Help', icon: 'icon-question-sign', func: $rootScope.help },
            { type: 'item', label: 'Info', icon: 'icon-info-sign', func: $rootScope.info }
        ]
    };
}