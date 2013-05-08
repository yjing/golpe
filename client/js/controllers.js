function LoginCtrl($scope, $rootScope, $location, auth) {
    // TMP CREDENTIALS
    $scope.username = "y.jing";
    $scope.password = "30071980";

    // TOP BAR
    $rootScope.top_bar = {
        back_button: {
            icon: 'icon-chevron-left'
        },
        page_title: 'Login',
        title_icon: 'icon-th-list',
        title_menu: [
            { label: 'Users', func: $scope.login, icon: 'icon-chevron-left' },
            { label: 'Projects', func: $scope.login, icon: 'icon-chevron-left' }
        ]
    }

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
    $scope.page_title = "Users";
    $scope.users = null;

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

    $scope.goProjects = function(){
        $location.url('/client/projects');
        $rootScope.toggleTitleMenu();
    }
}

function ProjectsCtrl($scope, $rootScope, $location, auth, Projects) {
    $scope.page_title = "Projects";

    $rootScope.busy(false);
    $scope.main = function() {
        $rootScope.busy(true);
        $scope.projects = Projects.all();
        $scope.projects.$then(function(){
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

    $scope.goUsers = function(){
        $location.url('/client/users');
        $rootScope.toggleTitleMenu();
    }
}