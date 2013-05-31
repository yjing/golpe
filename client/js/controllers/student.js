function StudentCtrl($scope, $rootScope, $location, auth, als, database){

    auth.user(
        function (user){
            if(user == null) {
                $location.url('/client/login');
                return;
            }
            als.all(
                'all',
                function(d, h) {
                    als.all(
                        'mine',
                        function(d, h) {
                            console.log(d);
                        },
                        function(e) {
                        }
                    );
                },
                function(e) {
                }
            );
        }
    );

    // TOP BAR
    $rootScope.top_bar = {
        page_title: 'Activity Logs',
        main_menu_items: [
            { type: 'item', label: 'Add Activity Log', icon: 'icon-plus', func: $rootScope.logout },
            { type: 'divider' },
            { type: 'item', label: 'Logout', icon: 'icon-lock', func: $rootScope.logout },
            { type: 'item', label: 'Help', icon: 'icon-question-sign', func: $rootScope.help },
            { type: 'item', label: 'Info', icon: 'icon-info-sign', func: $rootScope.info }
        ]
    };
}