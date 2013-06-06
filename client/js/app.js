/**
 mscproject module
 it defines the client side application.
 */
var app = angular.module('mscproject', [ 'ngResource', 'ui.bootstrap'],function ($routeProvider, $locationProvider) {
    $routeProvider.when('/client/login', {
        templateUrl:'/client/parts/login.html',
        controller:"LoginCtrl"
    });
    // STUDENT
    $routeProvider.when('/client/student', {
        templateUrl:'/client/parts/student.html',
        controller:"StudentCtrl"
    });
    $routeProvider.when('/client/student/:id', {
        templateUrl:'/client/parts/student.html',
        controller:"StudentCtrl"
    });
    // SUPERVISOR
    $routeProvider.when('/client/supervisor', {
        templateUrl:'/client/parts/supervisor.html',
        controller:"SupervisorCtrl"
    });
    $routeProvider.when('/client/supervisor/:id', {
        templateUrl:'/client/parts/supervisor.html',
        controller:"SupervisorCtrl"
    });
    $routeProvider.when('/client/supervisor/:id/:alid', {
        templateUrl:'/client/parts/supervisor.html',
        controller:"SupervisorCtrl"
    });
    // PROJECTS
    $routeProvider.when('/client/projects', {
        templateUrl:'/client/parts/projects.html',
        controller:"ProjectsCtrl"
    });
    $routeProvider.when('/client/projects/:id', {
        templateUrl:'/client/parts/projects.html',
        controller:"ProjectsCtrl"
    });
    $routeProvider.when('/client/projects/:id/:tid', {
        templateUrl:'/client/parts/projects.html',
        controller:"ProjectsCtrl"
    });
    // USERS
    $routeProvider.when('/client/users', {
        templateUrl:'/client/parts/users.html',
        controller:"UsersCtrl"
    });
    $routeProvider.when('/client/users/:id', {
        templateUrl:'/client/parts/users.html',
        controller:"UsersCtrl"
    });
    $routeProvider.when('/client/resolve?res=:res', {
//        templateUrl:'/client/parts/users.html',
        controller:"ResolverCtrl"
    });
    $routeProvider.otherwise({redirectTo:'/client/login'});

    // configure html5 to get links working
    // If you don't do this, you URLs will be base.com/#/home rather than base.com/home
    $locationProvider.html5Mode(true).hashPrefix('!');
}).run(function ($rootScope, $location, auth, database) {

        // DATABASE
        // database.createTable = function(table_name, pkey, belongsTo, hasMany){
        database.createTable('als', 'id', {
            user: { table:'users', fkey:'user_id' }
        }, {
            comments: { table:'comments', fkey:'activity_log_id' },
            media: { table:'media', fkey:'activity_log_id' }
        });
        database.createTable('comments', 'id', {
            als: { table:'als', fkey:'activity_log_id' }
        }, {});
        database.createTable('media', 'id', {
            als: { table:'als', fkey:'activity_log_id' }
        }, {});
        database.createTable('users', 'id', {
            team: { table:'teams', fkey:'team_id' },
            supervisor: { table:'users', fkey:'supervisor_id' }
        }, {
            als: { table:'als', fkey:'user_id' },
            media: { table:'media', fkey:'user_id' },
            comments: { table:'comments', fkey:'user_id' }
        });

        database.createTable('projects', 'id', {}, {
            teams: { table:'teams', fkey:'project_id' }
        });
        database.createTable('teams', 'id', {
            project: { table:'projects', fkey:'project_id' }
        }, {
            students: { table:'users', fkey:'team_id' }
        });

        // GENERAL FUNCTIONS
        $rootScope.info = function () {
            $rootScope.toggleMenu();
        }

        $rootScope.help = function () {
            $rootScope.toggleMenu();
        }

        $rootScope.logout = function () {
            auth.logout(
                function(user){
                    $rootScope.mode = null;
                    $rootScope.redirectUser();
                }
            );
        }

        $rootScope.redirectUser = function () {
            if(angular.isUndefined($rootScope.user) || $rootScope.user == null) {
                $location.url('/client/login');
                return;
            }

            if(angular.isDefined($rootScope.redirectAfterLogin) && $rootScope.redirectAfterLogin != null) {
                $location.url($rootScope.redirectAfterLogin);
                $rootScope.redirectAfterLogin = null;
                return;
            }

            var role = $rootScope.user.role;
            switch (role) {
                case 'STUDENT':
                    $location.url('/client/student');
                    break;
                case 'SUPERVISOR':
                    $location.url('/client/supervisor');
                    break;
                case 'ADMIN':
                    $location.url('/client/projects');
                    break;
                default:
                    $location.url('/client/login');
            }
        };

        $rootScope.handleError = function (err_data) {
            console.log("Handling error");
            if (err_data.status == 401 && err_data.data.message == 'NO-LOGGED') {
                $rootScope.user = null;
                if(angular.isUndefined($rootScope.redirectAfterLogin) || $rootScope.redirectAfterLogin == null) {
                    $rootScope.redirectAfterLogin = $location.url();
                }
                $location.url('/client/login');
                return true;
            }
            return false;
        }
        $rootScope.windowWidth = $(window).width();
        $rootScope.isMobile = $rootScope.windowWidth < 768;
        $(window).resize(function () {
            $rootScope.$apply(function () {
                $rootScope.windowWidth = $(window).width();
                $rootScope.isMobile = ($rootScope.windowWidth < 768);
            });
        });

        // THUMBS HELPER
        $rootScope.getThumbUrl = function (media) {
            if (angular.isDefined(media) && media['has_thumb']) {
                return "/media/download/" + media['id'] + "?thumb=BIG";
            } else {
                switch (media['content-type']) {
                    case "image/png":
                        return "/client/img/default_thumbs/png.png";
                        break;
                    case "image/jpeg":
                        return "/client/img/default_thumbs/jpeg.png";
                        break;
                    case "image/gif":
                        return "/client/img/default_thumbs/gif.png";
                        break;
                    case "application/json":
                        return "/client/img/default_thumbs/json.png";
                        break;
                    case "application/zip":
                        return "/client/img/default_thumbs/zip.png";
                        break;
                    case "application/pdf":
                        return "/client/img/default_thumbs/pdf.png";
                        break;
                    case "text/xml":
                        return "/client/img/default_thumbs/xml.png";
                        break;
                    case "text/html":
                        return "/client/img/default_thumbs/html.png";
                        break;
                    case "application/msword":
                        return "/client/img/default_thumbs/doc.png";
                        break;
                    case "application/vnd.openxmlformats-officedocument":
                        return "/client/img/default_thumbs/office.png";
                        break;
                    default:
                        return "/client/img/default_thumbs/file.png";
                        break;
                }
            }
        }

    });

function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}