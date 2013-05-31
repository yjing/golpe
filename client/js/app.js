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