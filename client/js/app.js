/**
 mscproject module
 it defines the client side application.
 */
var app = angular.module('mscproject', [ 'ngResource', 'ui.bootstrap'],function ($routeProvider, $locationProvider) {
    $routeProvider.when('/client/login', {
        templateUrl:'/client/parts/login.html',
        controller:"LoginCtrl"
    });
    $routeProvider.when('/client/student', {
        templateUrl:'/client/parts/student.html',
        controller:"StudentCtrl"
    });
    $routeProvider.when('/client/student/:id', {
        templateUrl:'/client/parts/student.html',
        controller:"StudentCtrl"
    });
    $routeProvider.otherwise({redirectTo:'/client/login'});

    // configure html5 to get links working
    // If you don't do this, you URLs will be base.com/#/home rather than base.com/home
    $locationProvider.html5Mode(true).hashPrefix('!');
}).run(function ($rootScope, database) {

        // DATABASE
        database.createTable('als', 'id', {}, {
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
            als: { table:'als', fkey:'user_id' },
            media: { table:'media', fkey:'user_id' },
            comments: { table:'comments', fkey:'user_id' }
        }, {});

        // GENERAL FUNCTIONS
        $rootScope.info = function () {
            $rootScope.toggleMenu();
        }

        $rootScope.help = function () {
            $rootScope.toggleMenu();
        }

        $rootScope.logout = function () {
            $rootScope.toggleMenu();
            BusyService.busy(true);

            $rootScope.user = auth.logout();
            $rootScope.user.$then(
                function () {
                    console.log($rootScope.user);
                    BusyService.busy(false);
                    $location.url('/client/login');
                },
                function () {
                    BusyService.busy(false);
                    $location.url('/client/login');
                }
            )
        }

        $rootScope.error = function (err_data) {
            if (err_data.status == 401 && err_data.message == 'NO-LOGGED') {
                $location.url('/client/login');
                return true;
            }
            return false;
        }
        $rootScope.windowWidth = $(window).width();
        $rootScope.isMobile = $rootScope.windowWidth < 767;
        $(window).resize(function () {
            $rootScope.$apply(function () {
                $rootScope.windowWidth = $(window).width();
                $rootScope.isMobile = ($rootScope.windowWidth < 767);
            });
        });

    });

function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}