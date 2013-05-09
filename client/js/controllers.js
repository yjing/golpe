function LoginCtrl($scope, $rootScope, $location, auth) {
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
        $rootScope.busy(true);
        $rootScope.user = auth.auth($scope.username, $scope.password);
        $rootScope.user.$then(
            function(){
                console.log($rootScope.user);
                $rootScope.busy(false);
                if( $rootScope.user['logged'] ) {
                    $scope.redirectUser();
                } else {
                    $scope.login_message = "Login failed";
                }
            },
            function(){
                $rootScope.busy(false);
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

    $rootScope.busy(true);
    $rootScope.user = auth.user();
    $rootScope.user.$then(function(){
        $rootScope.busy(false);
        $scope.redirectUser();
    });

}

function UsersCtrl($scope, $rootScope, $location, Users, auth) {
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


    $rootScope.busy(false);
    $scope.main = function() {
        $rootScope.busy(true);
        $scope.users = Users.all();
        $scope.users.$then(function(){
            $rootScope.busy(false);
        });
    }

    if($rootScope.user == null || !$rootScope.user['logged']) {
        $rootScope.busy(true);
        $rootScope.user = auth.user();
        $rootScope.user.$then(function(){
            $rootScope.busy(false);
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

function ProjectsCtrl($scope, $rootScope, $location, auth, Projects) {
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

    $rootScope.busy(false);
    $scope.main = function() {
        $rootScope.busy(true);
        $scope.projects = Projects.all(
            function(){
                $rootScope.busy(false);
                for(var i=0; i<$scope.projects.length; i++) {
                    $scope.projects[i].mode = 'normal';
                    $scope.projects[i].status = 'partial';
                }
                if($scope.projects.length > 0) {
                    $scope.showProject(0);
                }
            }
        );
    }

    if($rootScope.user == null || !$rootScope.user['logged']) {
        $rootScope.busy(true);
        $rootScope.user = auth.user();
        $rootScope.user.$then(function(){
            $rootScope.busy(false);
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
        $scope.edit = false;
        $location.url('/client/users');
        $rootScope.toggleTitleMenu();
    }

    $scope.p_index = null;
    $scope.showProject = function(index){
        // CHANGE ACTIVE PROJECT
        if($scope.p_index != null) {
            $scope.projects[$scope.p_index].active = '';
        }
        $scope.projects[index].active = 'active';
        $scope.p_index = index;

        // IF PROJECT IS NOT IN FULLPROJECTS FETCH IT
        if($scope.projects[index].mode == 'partial') {
            $rootScope.busy(true);
            var proj = Projects.get(
                {id:$scope.projects[index].Project.id},
                function(data, headers){
                    $rootScope.busy(false);
                    proj.mode = 'normal';
                    proj.status = 'complete';
                    $scope.projects[index] = proj;
                }
            );
        }
    }

    $scope.editProject = function(){
        $scope.projects[$scope.p_index].old = angular.copy($scope.projects[$scope.p_index]);
        $scope.projects[$scope.p_index].mode = 'edit';
    }
    $scope.cancelEdit = function(){
        console.log($scope.projects[$scope.p_index]);
        if($scope.projects[$scope.p_index].status == 'new') {
            console.log($scope.projects);
            $scope.projects.splice($scope.projects.length, 1);
            console.log($scope.projects);
            $scope.showProject(0);
        } else {
            $scope.projects[$scope.p_index] = $scope.projects[$scope.p_index].old;
        }
    }
    $scope.saveProject = function(){
        $rootScope.busy(true);
        var params = {};
        if($scope.projects[$scope.p_index].mode != 'new') {
            params = {id:$scope.projects[$scope.p_index].Project.id};
        }
        var proj = Projects.save(
            params,
            $scope.projects[$scope.p_index],
            function() {
                $rootScope.busy(false);
                $scope.projects[$scope.p_index] = proj;
                $scope.projects[$scope.p_index].mode = 'complete';
            },
            function() {
                $rootScope.busy(false);
                console.log(proj);
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

    $scope.isActive = function(index) {
        if(index == $scope.p_index) {
            return 'active';
        }
    }

    $scope.description_active = 'active';
    $scope.teams_active = '';
    $scope.showTeams = function() {
        $scope.edit = false;
        $scope.description_active = '';
        $scope.teams_active = 'active';
    }
    $scope.showDescription = function() {
        $scope.edit = false;
        $scope.description_active = 'active';
        $scope.teams_active = '';
    }
}


function ProjectCtrl($scope, $rootScope, $location, auth, Projects, $routeParams) {
    // TOP BAR
    $rootScope.top_bar = {
        back_button: {
            icon: 'icon-chevron-left',
            func: function() {
                $location.url('/client/projects');
            }
        },
        page_title: 'Project',
//        title_icon: 'icon-th-list',
//        title_menu: [
//            {
//                label: 'Users',
//                func: function() {
//                    $rootScope.toggleTitleMenu();
//                    $location.url('/client/users');
//                }
//            }
//        ],
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


    $rootScope.busy(false);
    $scope.main = function() {
        $rootScope.busy(true);
        $scope.project = Projects.get({id:$routeParams['id']});
        $scope.project.$then(function(){
            $rootScope.busy(false);
        });
    }

    if($rootScope.user == null || !$rootScope.user['logged']) {
        $rootScope.busy(true);
        $rootScope.user = auth.user();
        $rootScope.user.$then(function(){
            $rootScope.busy(false);
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