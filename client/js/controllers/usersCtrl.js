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
    $scope.selected_u = null;
    $scope.selected_u_id = $routeParams.id;

    $scope.go = function(id){
        var url = '/client/users';
        if (angular.isDefined(id)) {
            url += '/' + id;
        }
        $location.url(url);
    };

    $scope.loadAll = function (reload) {
        if (angular.isDefined($scope.selected_u_id) && $scope.selected_u_id != null) {
            if($scope.selected_u_id == 'new') {
                $scope.selected_u = {};
            } else {
                users.load(
                    $scope.selected_u_id,
                    function (d, h) {    // SUCCESS
                        $scope.selected_u = database.select('users', [ {field:'id',value:$scope.selected_u_id} ], 3)[0];
                        console.log($scope.selected_u);
                    }
                );
            }
        }

        users.all(
            reload,               // RELOAD
            function(d, h) {     // SUCCESS
                $scope.data = database.select('users', $scope.r_conds, 3);
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

    $scope.editSelectedU = function () {
        $scope.edit_u = true;
    };

    $scope.unEditSelectedU = function () {
        $scope.selected_u = database.select('users', [ {field:'id',value:$scope.selected_u_id} ], 3)[0];
        $scope.edit_u = false;
    };

}

function DialogCtrl($scope, dialog){
    $scope.close = function(result){
        dialog.close(result);
    };
}