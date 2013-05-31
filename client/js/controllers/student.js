function StudentCtrl($scope, $rootScope, $location, auth, als, database){

    auth.user(
        function (user){
            if(user == null) {
                $location.url('/client/login');
                return;
            }
            als.all(
                false,                          // RELOAD
                'all',                          // MODE
                function(d, h) {                // SUCCESS
                    if(angular.isArray(d) && d.length > 0) {
                        als.get(
                            d[0].id,
                            function(d, h) {
                                console.log(d);
                                d['id'] = 21;
                                console.log(database.select('als', [], 3));
                            },
                            function(e) {
                            }
                        );
                    }
                },
                function(e) {                   // ERROR
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