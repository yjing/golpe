function UsersCtrl($scope, $rootScope, $routeParams, $location, $dialog, auth, database, projects, users, teams){
    // TOP BAR
    $scope.setupTopBar = function () {
        $rootScope.top_bar = {
            page_title:'Users',
            title_menu: [ { label: 'Projects', func: function(){ $location.url('/client/projects') } } ],
            main_menu_items:[
                { type:'item', label:'Logout', icon:'icon-lock', func:$rootScope.logout },
                { type:'item', label:'Help', icon:'icon-question-sign', func:$rootScope.help },
                { type:'item', label:'Info', icon:'icon-info-sign', func:$rootScope.info }
            ]
        };
    }

    $scope.setupTopBar();

    $scope.data = [];

    $scope.loadAll = function (reload) {
        if (angular.isDefined($scope.selected_p_id) && $scope.selected_p_id != null) {
            if($scope.selected_p_id == 'new') {
                $scope.selected_p = {};
            } else {
                projects.load(
                    $scope.selected_p_id,
                    function (d, h) {    // SUCCESS
                        $scope.selected_p = database.select('projects', [ {field:'id',value:$scope.selected_p_id} ], 3)[0];
                        users.all(false,
                            function(d, h){
                                if(angular.isDefined($scope.selected_t_id) && $scope.selected_t_id) {
                                    $scope.selected_t = database.select('teams', [ {field:'id',value:$scope.selected_t_id} ], 3)[0];
                                }
                            }
                        );
                    }
                );
            }
        }

        users.all(
            reload,               // RELOAD
            function(d, h) {     // SUCCESS
                $scope.data = database.select('users',[], 3);
            }
        );
    };

    auth.user(
        function (user) {

            if(angular.isUndefined(user) || user == null) {
                $rootScope.redirectAfterLogin = $location.url();
                $location.url('/client/login');
                return;
            }

            $scope.loadAll(false);
        }
    );

    $scope.selectedU = function (id) {
        return $scope.selected_u_id == id ? 'active' : '';
    };

}

function DialogCtrl($scope, dialog){
    $scope.close = function(result){
        dialog.close(result);
    };
}