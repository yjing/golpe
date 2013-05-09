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
        $scope.edit = false;
        $rootScope.busy(true);
        $scope.projects = Projects.all();
        $scope.projects.$then(function(){
            $rootScope.busy(false);
            if($scope.projects.length > 0) {
                $scope.showProject(0);
            }
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

    $scope.goUsers = function(){
        $scope.edit = false;
        $location.url('/client/users');
        $rootScope.toggleTitleMenu();
    }

    $scope.p_index = null;

    $scope.showProject = function(index){
        $scope.edit = false;
        // CHANGE ACTIVE PROJECT
        if($scope.p_index != null) {
            $scope.projects[$scope.p_index].active = '';
        }
        $scope.projects[index].active = 'active';
        $scope.p_index = index;

        // IF PROJECT IS NOT IN FULLPROJECTS FETCH IT
        if($scope.projects[index].full != true && !$scope.projects[index].new) {
            $rootScope.busy(true);
            var proj = Projects.get({id:$scope.projects[index].Project.id}, function(){
                $rootScope.busy(false);
                $scope.projects[index] = proj;
                // SETUP THE CURRENT PROJECT
                $scope.projects[index].full = true;
                $scope.projects[index].active = 'active';
                $scope.p_index = index;
            });
        }
    }

    $scope.edit = false;
    $scope.editProject = function(){
        $scope.edit = true;
        $scope.projects[$scope.p_index].description = $scope.projects[$scope.p_index].Project.description;
        $scope.projects[$scope.p_index].name = $scope.projects[$scope.p_index].Project.name;
    }
    $scope.cancelEdit = function(){
        $scope.edit = false;
        $scope.projects[$scope.p_index].Project.description = $scope.projects[$scope.p_index].description;
        $scope.projects[$scope.p_index].Project.name = $scope.projects[$scope.p_index].name;
        $scope.projects[$scope.p_index].description = null;
        $scope.projects[$scope.p_index].name = null;
    }
    $scope.saveProject = function(){
        $scope.edit = false;
        $rootScope.busy(true);
        if($scope.projects[$scope.p_index].new) {
            $scope.projects[$scope.p_index] = Projects.save($scope.projects[$scope.p_index]);
        } else {
            $scope.projects[$scope.p_index].$save({id:$scope.projects[$scope.p_index].Project.id},
                function() {
                    $rootScope.busy(false);
                }
            );
        }

    }
    $scope.newProject = function(){
        $scope.projects.push({
            "Project": {
                "name": "Project Name",
                "description": "Project Description"
            },
            "new":true
        });
        $scope.showProject($scope.projects.length - 1);
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