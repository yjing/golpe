function LoginCtrl($scope, $rootScope, $location, auth, BusyService) {
    // TMP CREDENTIALS
    $scope.username = "y.jing";
    $scope.password = "30071980";

    // TOP BAR
    $rootScope.top_bar = {
//        back_button: {
//            icon: 'icon-chevron-left'
//        },
        page_title: 'Login',
//        buttons: [
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' },
//            { type: 'divider-vertical' },
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' }
//        ],
        main_menu_items: [
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };

    $scope.login = function() {
        BusyService.busy(true);
        $rootScope.user = auth.auth($scope.username, $scope.password);
        $rootScope.user.$then(
            function(){
                console.log($rootScope.user);
                BusyService.busy(false);
                if( $rootScope.user['logged'] ) {
                    $scope.redirectUser();
                } else {
                    $scope.login_message = "Login failed";
                }
            },
            function(){
                BusyService.busy(false);
                $scope.login_message = "Login failed";
            }
        )
    }

    $scope.redirectUser = function() {
        if($rootScope.user['logged']) {
            switch ($rootScope.user['User']['role']) {
                case 'STUDENT':
                    $location.url('/client/student');
                    break;
                case 'SUPERVISOR':
                    $location.url('/client/supervisor');
                    break;
                case 'ADMIN':
                    $location.url('/client/users');
                    break;
            }
        }
    }

    BusyService.busy(true);
    $rootScope.user = auth.user();
    $rootScope.user.$then(function(){
        BusyService.busy(false);
        $scope.redirectUser();
    });

}

function UsersCtrl($scope, $rootScope, $location, Users, auth, BusyService) {
    // TOP BAR
    $rootScope.top_bar = {
//        back_button: {
//            icon: 'icon-chevron-left'
//        },
        page_title: 'Users',
        title_icon: 'icon-th-list',
        title_menu: [
            {
                label: 'Projects',
                func: function() {
                    $rootScope.toggleTitleMenu();
                    $location.url('/client/projects');
                }
            }
        ],
//        buttons: [
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' },
//            { type: 'divider-vertical' },
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' }
//        ],
        main_menu_items: [
            { type: 'item', label: 'Log Out', func: $rootScope.logout, icon: 'icon-lock' },
            { type: 'divider' },
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };


    BusyService.busy(false);
    $scope.main = function() {
        BusyService.busy(true);
        $scope.users = Users.all();
        $scope.users.$then(function(){
            BusyService.busy(false);
        });
    }

    if($rootScope.user == null || !$rootScope.user['logged']) {
        BusyService.busy(true);
        $rootScope.user = auth.user();
        $rootScope.user.$then(function(){
            BusyService.busy(false);
            if(!$rootScope.user['logged']) {
                $location.url('/client/login');
            } else {
                $scope.main();
            }
        });
    } else {
        $scope.main();
    }
}

function ProjectsCtrl($scope, $rootScope, $location, $resource, auth, Projects, ProjectsService, Users, BusyService) {
    // TOP BAR
    $rootScope.top_bar = {
//        back_button: {
//            icon: 'icon-chevron-left'
//        },
        page_title: 'Projects',
        title_icon: 'icon-th-list',
        title_menu: [
            {
                label: 'Users',
                func: function() {
                    $rootScope.toggleTitleMenu();
                    $location.url('/client/users');
                }
            }
        ],
//        buttons: [
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' },
//            { type: 'divider-vertical' },
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' }
//        ],
        main_menu_items: [
            { type: 'item', label: 'Log Out', func: $rootScope.logout, icon: 'icon-lock' },
            { type: 'divider' },
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };

    BusyService.busy(false);
    $scope.main = function() {

        ProjectsService.loadAll(
            // SUCCESS
            function(data, handlers){
                if(ProjectsService.projects.length > 0) {
                    ProjectsService.load(
                        0,
                        function(d, h){
                            ProjectsService.activate(0);
                        },
                        function(e) {
                            $rootScope.handleError(e);
                        }
                    );
                }
            },
            // ERROR
            function(error){
                $rootScope.handleError(error);
            }
        );

    }

    if($rootScope.user == null || !$rootScope.user['logged']) {
        BusyService.busy(true);
        $rootScope.user = auth.user();
        $rootScope.user.$then(function(){
            BusyService.busy(false);
            if(!$rootScope.user['logged']) {
                $location.url('/client/login');
            } else {
                $scope.main();
            }
        });
    } else {
        $scope.main();
    }

    $scope.goUsers = function(){
        $location.url('/client/users');
        $rootScope.toggleTitleMenu();
    }

    $scope.p_index = null;
    $scope.showProject = function(index){
        // CHANGE ACTIVE PROJECT

        ProjectsService.load(index,
            function(d, h){
                ProjectsService.activate(index);
            }
        );
    }

    $scope.cancelEdit = function(){
        if($scope.projects[$scope.p_index].status == 'new') {
            $scope.projects.splice($scope.p_index, 1);
            if($scope.projects.length > 0) {
                $scope.showProject(0);
            }
        } else {
            $scope.projects[$scope.p_index] = $scope.projects[$scope.p_index].old;
        }
    }
    $scope.saveProject = function(){
        BusyService.busy(true);
        var params = {};
        if($scope.projects[$scope.p_index].mode != 'new') {
            params = {id:$scope.projects[$scope.p_index].Project.id};
        }
        var proj = Projects.save(
            params,
            $scope.projects[$scope.p_index],
            function() {
                BusyService.busy(false);
                $scope.projects[$scope.p_index] = proj;
                $scope.projects[$scope.p_index].mode = 'complete';
            },
            function(data) {
                BusyService.busy(false);
                $rootScope.handleError(data);
                $scope.projects[$scope.p_index].errors = data.data.data_validation_errors;
                console.log($scope.projects[$scope.p_index]);
            }
        );
    }

    $scope.newProject = function(){
        $scope.projects.push({
            "Project": {
                "name": "Project Name",
                "description": "Project Description"
            },
            "mode":'edit',
            "status": 'new'
        });
        $scope.showProject($scope.projects.length - 1);
        $scope.teams_disabled = true;
    }

    $scope.t_id = null;
    $scope.students = null;
    $scope.addStudent = function(t_id){
        $scope.t_id = t_id;
        BusyService.busy(true);
        $scope.students = Users.all(
            function(data){
                BusyService.busy(false);
                console.log($scope.students);
            },
            function(err_data){
                $rootScope.handleError(err_data);
                BusyService.busy(false);
            }
        );
    }
    $scope.add = function(t_id, s_id){

        $scope.projects[$scope.p_index].Team.

        BusyService.busy(true);
        var Test = $resource('/teams/addMember/:tid/:sid',{},{
            add: {
                method: 'POST'
            }
        });
        Test.add({tid:t_id, sid:s_id},{},
            function(data){
                BusyService.busy(false);
                console.log(data);
            },
            function(err){
                BusyService.busy(false);
                console.log(err);
            }
        );
    }

    $scope.isActive = function(index) {
        if(index == $scope.p_index) {
            return 'active';
        }
    }

    $scope.description_active = 'active';
    $scope.teams_active = '';
    $scope.showTeams = function() {
        $scope.description_active = '';
        $scope.teams_active = 'active';
    }
    $scope.showDescription = function() {
        $scope.description_active = 'active';
        $scope.teams_active = '';
    }
}