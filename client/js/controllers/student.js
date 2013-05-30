function LoginCtrl($scope, $rootScope, auth){

    auth.user(
        function (user){
            if(user != null) {
                $scope.redirectUser(user);
            }
        }
    );

    // TOP BAR
    $rootScope.top_bar = {
        page_title: 'Activity Logs',
        main_menu_items: [
            { type: 'item', label: 'Logout', icon: 'icon-user', func: $rootScope.logout },
            { type: 'separator' },
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };
}