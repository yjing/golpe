function LoginCtrl($scope, $rootScope, comm){

    $scope.username = "s.susini";
    $scope.password = "30071980";

    // TOP BAR
    $rootScope.top_bar = {
        page_title: 'Login',
        main_menu_items: [
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };
}