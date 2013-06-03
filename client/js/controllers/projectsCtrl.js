function ProjectsCtrl($scope, $rootScope, $routeParams, $location, auth, database, projects){
    // TOP BAR
    $scope.setupTopBar = function () {
        $rootScope.top_bar = {
            page_title:'Projects',
            main_menu_items:[
                { type:'item', label:'Logout', icon:'icon-lock', func:$rootScope.logout },
                { type:'item', label:'Help', icon:'icon-question-sign', func:$rootScope.help },
                { type:'item', label:'Info', icon:'icon-info-sign', func:$rootScope.info }
            ]
        };
    }

    $scope.setupTopBar();

    $scope.data = [];
    $scope.selected_p_id = $routeParams.id;
    $scope.selected_p = null;
    $scope.edit_selected = false;


    auth.user(
        function (user) {
            if(angular.isUndefined(user) || user == null) {
                $rootScope.redirectAfterLogin = $location.url();
                $location.url('/client/login');
                return;
            }


            if (angular.isDefined($scope.selected_p_id) && $scope.selected_p_id != null) {
                projects.load(
                    $scope.selected_p_id,
                    function (d, h) {    // SUCCESS
                        $scope.selected_p = database.select('projects', [ {field:'id',value:$scope.selected_p_id} ], 3)[0];
                        console.log(database.select('teams', [ {field:'project_id',value:$scope.selected_p_id} ], 3));
                    }
                );
            }

//            projects.all(
//                false,               // RELOAD
//                function(d, h) {    // SUCCESS
//                    $scope.data = database.select('projects',[], 3);
//                }
//            );
        }
    );

    $scope.go = function(id){
        var url = '/client/projects';
        if (angular.isDefined(id)) {
            url += '/' + id;
        }
        $location.url(url);
    };

}
