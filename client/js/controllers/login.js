function LoginCtrl($scope, $rootScope, auth){

    $scope.username = "s.susini";
    $scope.password = "30071980";

    auth.login($scope.username, $scope.password,
        function (user){
            console.log(user);
            auth.logout (function (user){
                console.log(user);
            });
        }
    );

    // TOP BAR
    $rootScope.top_bar = {
        page_title: 'Login',
        main_menu_items: [
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };
}