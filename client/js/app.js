/**
mscproject module
it defines the client side application.
*/
var app = angular.module('mscproject', [ 'ngResource', 'ngCookies', 'SSUtilities' ], function($routeProvider, $locationProvider) {
    $routeProvider.when('/client/login', {
        templateUrl: '/client/partials/login.html',
        controller: "LoginCtrl"
    });
    $routeProvider.when('/client/al', {
        templateUrl: '/client/partials/al.html',
        controller: "AlCtrl"
    });
    $routeProvider.when('/client/al/:id', {
        templateUrl: '/client/partials/al.html',
        controller: "AlCtrl"
    });
    $routeProvider.when('/client/users', {
        templateUrl: '/client/partials/user.html',
        controller: "UserCtrl"
    });
    $routeProvider.when('/client/users/:id', {
        templateUrl: '/client/partials/user.html',
        controller: "UserCtrl"
    });
    $routeProvider.otherwise( {redirectTo: '/client/login'} );

    // configure html5 to get links working
    // If you don't do this, you URLs will be base.com/#/home rather than base.com/home
    $locationProvider.html5Mode(true).hashPrefix('!');
}).run(function($rootScope) {
    $rootScope.REDIRECT_AFTER_LOGIN = '/client/al';
    $rootScope.LOGIN_URI = '/client/login';

    $rootScope.modes = ["mine", "team", "public"];
    $rootScope.mode = "mine";
    console.log($rootScope.mode);

    $rootScope.getThumbUrl = function(media){
        if(media['Media']['has_thumb']) {
            return "/media/download/" + media['Media']['id'] + "?thumb=BIG";
        } else {
            console.log(media['Media']['content-type']);
            switch (media['Media']['content-type']) {
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

})
.service('auth', function($http){
    this.username = null;
    this.password = null;

    this.credentials = function(username, password){
        this.username = username;
        this.password = password;
    }

    this.auth = function(callback){
        var xsrf = null;
        if(this.username!=null && this.password!=null) {
            xsrf = $.param({
                "data[User][username]" : this.username,
                "data[User][password]" : this.password
            });
        }

        $http({
            method: "POST",
            url: "/users/login",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            data:xsrf
        }).
        success(function(data, status, headers, config){
            console.log(data);
            console.log(data['User']);
            if (data['logged']) {
                if(callback)
                    callback(data['User']);
            } else {
                if(callback)
                    callback(false);
            }
        }).
        error(function(data, status, headers, config) {
            console.log('ERROR:');
            console.log(data);
            console.log(status);
            console.log(config);
            if(callback)
                callback(false);
        });
    }

    this.logout = function(callback) {
        $http({
            method: "GET",
            url: "/users/logout"
        }).
        success(function(data, status, headers, config){
            console.log(data);
            console.log(status);
            console.log(config);
            callback(true);
        }).
        error(function(data, status, headers, config) {
            console.log('ERROR:');
            console.log(data);
            console.log(status);
            console.log(config);
            callback(false);
        });
        this.username = null;
        this.password = null;
    }
})
;


function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function AlCtrl($scope, $rootScope, $location, $routeParams, $resource, $filter, auth, DialogService, WindDims) {

    console.log($rootScope.mode);

    auth.auth(function(result){
        if (!result) {
            $location.url($scope.LOGIN_URI);
        }
    });

    $scope.mainmenu_open = "";
    $scope.toggleMenu = function() {
        if($scope.mainmenu_open.length == 0) {
            $scope.mainmenu_open = "open";
        } else {
            $scope.mainmenu_open = "";
        }
    }
    $scope.titlemenu_open = "";
    $scope.toggleTitleMenu = function() {
        if($scope.titlemenu_open.length == 0) {
            $scope.titlemenu_open = "open";
        } else {
            $scope.titlemenu_open = "";
        }
    }

    var ALs = $resource('/activity_logs/:id?mode=:mode');
    var Media = $resource('media/:id');
    $scope.al = null;
    $scope.files = [];

    $scope.addFile = function() {
        $scope.files.push({});
    }
    $scope.removeFile = function(index) {
        if (index < $scope.files.length) {
            $scope.files.splice(index, 1);
        }
    }

    if(!$routeParams['id']) {

        $scope.predicate = '-ActivityLog.modified';
        $scope.activityLogs = ALs.query({mode:$rootScope.mode}, function(){});

        // I-FRAME LISTENER SETUP
        // Used to handle the new Activity Logs
        var iframe = document.getElementById('iframeNewAl');
        iframe.addEventListener("load", function(){

            // Message from server...
            if (iframe.contentDocument) {
                content = iframe.contentDocument.body.innerHTML;
            } else if (iframe.contentWindow) {
                content = iframe.contentWindow.document.body.innerHTML;
            } else if (iframe.document) {
                content = iframe.document.body.innerHTML;
            }

            // Check Result
            var result = $(content).text();
            try {
                result = JSON.parse(result);
            } catch (e) {
                //ERROR
                $scope.confirm_message = result;
                DialogService.createDialog("alert", $scope, "/client/partials/dialogs/confirm.html", {
                    autoOpen: true,
                    width: "50%",
                    modal: false,
                    buttons: [ { text: "OK", click: function(){
                        DialogService.destroyDialog("alert");
                    } } ],
                    close: function() { DialogService.destroyDialog("alert") }
                });
            }

            // Refresh DATA
            $scope.activityLogs = ALs.query({mode:$rootScope.mode}, function(){});

        }, true);

        $scope.newAl = function(){
            var w = "50%";
            if (WindDims.getWinDims()['w'] < 769) {
                w = "95%";
            }
            DialogService.createDialog("newAl", $scope, "/client/partials/dialogs/newAl.html", {
                modal: true,
                width: w,
//                position: { my: "top", at: "top", of: window },
                buttons: [
                    { text: "OK", click: function(){
                        $scope.submitALForm();
                    } }, { text: "Cancel", click: function(){
                        $scope.hideNewAl();
                    } }
                ],
                beforeClose: function(){
                    $scope.$apply(function(){
                        document.forms[0].reset();
                        $scope.files = [];
                        DialogService.destroyDialog("newAl");
                    });
                    return false;
                }
            });
            DialogService.openDialog("newAl");
        }
        $scope.hideNewAl = function(){
            document.forms[0].reset();
            DialogService.closeDialog("newAl");
        }

        $scope.submitALForm = function() {
            document.forms[0].submit();
            $scope.hideNewAl();
        }


        $scope.showAl = function(elem) {
            $location.url('/client/al/'+elem.item.ActivityLog.id);
        }

        $scope.edit = function(elem) {
            console.log(elem);
        }

        $scope.delete = function(elem) {
            DialogService.createDialog("confirm", $scope, "/client/partials/dialogs/confirm.html", {
                autoOpen: false,
                width: "50%",
                modal: true,
                buttons: [ { text: "Yes", click: function(){
                    DialogService.destroyDialog("confirm");
                    var ret = ALs.delete({id:elem.item.ActivityLog.id}, function(){
                        var ALs2 = $resource('/activity_logs/:id');
                        $scope.activityLogs = ALs2.query(function(){});
                        console.log($scope.activityLogs);
                    },function(){
                        $scope.confirm_message = "An error has occurred";
                        DialogService.createDialog("alert", $scope, "/client/partials/dialogs/confirm.html", {
                            autoOpen: true,
                            width: "50%",
                            modal: false,
                            buttons: [ { text: "OK", click: function(){
                                DialogService.destroyDialog("alert");
                            } } ],
                            close: function() { DialogService.destroyDialog("alert") }
                        });
                    }
                    );
                } }, {text: "No", click: function(){
                    DialogService.destroyDialog("confirm");
                } } ]
            });
            $scope.confirm_message = "Are you sure to delete \"" + elem.item['ActivityLog']['title'] + "\" activity log?";
            DialogService.openDialog("confirm");
        }

        $scope.reload = function(){
            $scope.activityLogs = ALs.query({mode:$rootScope.mode}, function(){});
        }

        $scope.updateMode = function(){
            $scope.reload();
        }

    } else {

        $scope.show_media = false;
        $scope.showMedia = function(media){
            if(media['Media']['content-type'].indexOf("image/") == 0) {
                $scope.show_media = true;
                console.log("/media/download/" + media['Media']['Media']['id']);
                $scope.media_url = "/media/download/" + media['Media']['Media']['id'];
            } else {
                window.location.href = "/media/download/" + media['Media']['Media']['id'] + "?download=true";
            }
        }
        $scope.hideMedia = function(){
            $scope.show_media = false;
            $scope.media_url = "";
        }

        $scope.back = function() {
            $location.url('/client/al/');
        }
        $scope.al = ALs.get({id:$routeParams['id']}, function() {
            console.log($scope.al);
        });

        $scope.reload = function(){
            $scope.al = ALs.get({id:$routeParams['id']}, function() {
                console.log($scope.al);
            });
        }

        $scope.newCom = function(){
            var w = "50%";
            if (WindDims.getWinDims()['w'] < 769) {
                w = "95%";
            }
            DialogService.createDialog("newCom", $scope, "/client/partials/dialogs/newCom.html", {
                modal: true,
                width: w,
//                position: { my: "top", at: "top", of: window },
                buttons: [
                    { text: "OK", click: function(){
                        $scope.submitComForm();
                    } }, { text: "Cancel", click: function(){
                        $scope.hideNewCom();
                    } }
                ],
                beforeClose: function(){
                    $scope.$apply(function(){
                        document.forms[0].reset();
                        $scope.files = [];
                        DialogService.destroyDialog("newCom");
                    });
                    return false;
                }
            });
            DialogService.openDialog("newCom");
        }

        $scope.submitComForm = function() {
            document.forms[0].submit();
        }
    }

    $scope.logout = function() {
        auth.logout(function(result){
            console.log(result);
            if(result) {
                $location.url($scope.LOGIN_URI);
            }
        });
    }

}

function LoginCtrl($scope, $location, $cookies, $http, auth) {

    $scope.mainmenu_open = "";
    $scope.toggleMenu = function() {
        if($scope.mainmenu_open.length == 0) {
            $scope.mainmenu_open = "open";
        } else {
            $scope.mainmenu_open = "";
        }
    }
    $scope.titlemenu_open = "";
    $scope.toggleTitleMenu = function() {
        if($scope.titlemenu_open.length == 0) {
            $scope.titlemenu_open = "open";
        } else {
            $scope.titlemenu_open = "";
        }
    }

    $scope.username = "s.susini";
    $scope.password = "30071980";

    $scope.show_logout = false;

    auth.auth(function(result){
        if (result) {
            console.log(result);
            $location.url($scope.REDIRECT_AFTER_LOGIN);
        }
    });

    $scope.login = function() {

        auth.credentials($scope.username, $scope.password);
        auth.auth(function(result){
            console.log(result);
            $scope.show_logout = true;
            if(result) {
                $location.url($scope.REDIRECT_AFTER_LOGIN);
                $scope.show_logout = true;
            } else {
                // TODO: message user wrong login!
            }
        });

    };

    $scope.logout = function() {
        auth.logout(function(result){
            console.log(result);
            $scope.show_logout = false;
        });
    }

}