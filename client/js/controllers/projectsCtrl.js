function ProjectsCtrl($scope, $rootScope, $routeParams, $location, auth, database, projects, users){
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
    $scope.edit_p = false;
    $scope.delete_p = false;

    $scope.selected_t_id = $routeParams.tid;
    $scope.selected_t = null;
    $scope.edit_t = false;
    $scope.delete_t = false;


    auth.user(
        function (user) {
            users.all(false);

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

                        if(angular.isDefined($scope.selected_t_id) && $scope.selected_t_id) {
                            $scope.selected_t = database.select('teams', [ {field:'id',value:$scope.selected_t_id} ], 3)[0];
                            $scope.showAddMember();
                        }
                    }
                );
            }

            projects.all(
                false,               // RELOAD
                function(d, h) {     // SUCCESS
                    $scope.data = database.select('projects',[], 3);
                }
            );
        }
    );

    $scope.go = function(id, t_id){
        var url = '/client/projects';
        if (angular.isDefined(id)) {
            url += '/' + id;
        }
        if (angular.isDefined(t_id)) {
            url += '/' + t_id;
        }
        $location.url(url);
    };

    $scope.selectedP = function (id) {
        return $scope.selected_p_id == id ? 'active' : '';
    };

    $scope.selectedT = function (id) {
        return $scope.selected_t_id == id ? 'active' : '';
    };

    $scope.showAddMember = function () {
        $scope.member_list = $scope.filterTeamedStudents(database.select('users', [ {field:'role',value:'STUDENT'} ], 1));
    };


    $scope.filterTeamedStudents = function(students) {
        var list = [];
        for (var i = 0; i < students.length; i++) {
            if(angular.isUndefined(students[i].teams) || students[i].teams == null){
                list.push(students[i]);
            }

        }
        return list;
    }

}
