/**
 mscproject module
 it defines the client side application.
 */
var app = angular.module('mscproject', [ 'ngResource', 'ui.bootstrap'],function ($routeProvider, $locationProvider) {
//    $routeProvider.when('/client/login', {
//        templateUrl:'/client/partials/login.html',
//        controller:"LoginCtrl"
//    });
//    $routeProvider.otherwise({redirectTo:'/client/login'});

    // configure html5 to get links working
    // If you don't do this, you URLs will be base.com/#/home rather than base.com/home
    $locationProvider.html5Mode(true).hashPrefix('!');
}).run(function ($rootScope, $location, auth, BusyService, database) {});

function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function TestCtrl(){
    $scope.isCollapsed = false;
}