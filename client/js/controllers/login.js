function LoginCtrl($scope, $rootScope){

    // TOP BAR
    $rootScope.top_bar = {
//        back_button: {
//            icon: 'icon-chevron-left',
//            func: function(){ alert('test'); }
//        },
        page_title: 'Login',
        title_icon: 'icon-th-list',
        title_menu: [
            {
                label: 'Projects',
                func: function() {
                    alert('Ciao');
                }
            }
        ],
        buttons: [
            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' },
            { type: 'divider-vertical' },
            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' }
        ],
        main_menu_items: [
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };
}