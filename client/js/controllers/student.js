function StudentCtrl($scope, $rootScope, $routeParams, $location, auth, als, database) {

    $scope.data = null;
    $scope.selected_al_id = $routeParams.id;
    $scope.selected_al = null;

    auth.user(
        function (user) {
            if (user == null) {
                $location.url('/client/login');
                return;
            }
            als.all(
                false, // RELOAD
                'all', // MODE
                function (d, h) {                // SUCCESS
                    $scope.data = d;
                    if (angular.isDefined($scope.selected_al_id)
                        && $scope.selected_al_id != null
                        ) {

                        als.get(
                            $scope.selected_al_id,
                            function (d, h) {    // SUCCESS
                                $scope.selected_al = d;
                            }
                        );
                    }
                }
            );
        }
    );

    $scope.go = function (id) {
        var url = '/client/student';
        if (angular.isDefined(id)) {
            url += '/' + id;
        }
        $location.url(url);
    };

    $scope.reload = function () {
        als.all(
            true,
            'all',
            function (d, h) {    // SUCCESS
                $scope.data = d;
            }
        );
    };

    // TOP BAR
    $rootScope.top_bar = {
        page_title:'Activity Logs',
        main_menu_items:[
            { type:'item', label:'New Activity Log', icon:'icon-plus', func:$rootScope.logout },
            { type:'divider' },
            { type:'item', label:'Logout', icon:'icon-lock', func:$rootScope.logout },
            { type:'item', label:'Help', icon:'icon-question-sign', func:$rootScope.help },
            { type:'item', label:'Info', icon:'icon-info-sign', func:$rootScope.info }
        ]
    };
}