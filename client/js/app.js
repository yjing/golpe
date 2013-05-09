/**
mscproject module
it defines the client side application.
*/
var app = angular.module('mscproject', [ 'ngResource' ], function($routeProvider, $locationProvider) {
    $routeProvider.when('/client/login', {
        templateUrl: '/client/partials/login.html',
        controller: "LoginCtrl"
    });
    $routeProvider.when('/client/student', {
        templateUrl: '/client/partials/student.html',
        controller: "StudentCtrl"
    });
    $routeProvider.when('/client/supervisor', {
        templateUrl: '/client/partials/supervisor.html',
        controller: "SupervisorCtrl"
    });
    $routeProvider.when('/client/users', {
        templateUrl: '/client/partials/users.html',
        controller: "UsersCtrl"
    });
    $routeProvider.when('/client/projects', {
        templateUrl: '/client/partials/projects.html',
        controller: "ProjectsCtrl"
    });
    $routeProvider.when('/client/project/:id', {
        templateUrl: '/client/partials/project.html',
        controller: "ProjectCtrl"
    });
    $routeProvider.otherwise( {redirectTo: '/client/login'} );

    // configure html5 to get links working
    // If you don't do this, you URLs will be base.com/#/home rather than base.com/home
    $locationProvider.html5Mode(true).hashPrefix('!');
}).run(function($rootScope, $location, auth) {

    $rootScope.top_bar_url = '/client/partials/topbar.html';

    // MENUS and ACTIVITY BAR
    $rootScope.busy_class = "";
    $rootScope.busy_monitor = 0;
    $rootScope.busy = function(busy) {
        if(busy) {
            $rootScope.busy_monitor++;
            $rootScope.busy_class = "busy";
        } else {
            $rootScope.busy_monitor--;
            if($rootScope.busy_monitor <= 0) {
                $rootScope.busy_monitor = 0;
                $rootScope.busy_class = "";
            }
        }
    }

    $rootScope.mainmenu_open = "";
    $rootScope.toggleMenu = function() {
        if($rootScope.mainmenu_open.length == 0) {
            $rootScope.mainmenu_open = "open";
        } else {
            $rootScope.mainmenu_open = "";
        }
    }
    $rootScope.titlemenu_open = "";
    $rootScope.toggleTitleMenu = function() {
        menu = angular.element('.title_menu');
        topbar = angular.element('.topbar');
        brand = angular.element('.brand');
        body = angular.element('body');

        menu.css('position', 'absolute');
        menu.css('top',  (brand.position().top + brand.outerHeight()) + 'px');
        menu.css('left', (brand.position().left + 15) + 'px');

        if($rootScope.titlemenu_open.length == 0) {
            $rootScope.titlemenu_open = "open";
        } else {
            $rootScope.titlemenu_open = "";
        }
    }

    $rootScope.info = function() {
        $rootScope.toggleMenu();
    }
    $rootScope.help = function() {
        $rootScope.toggleMenu();
    }

    $rootScope.logout = function() {
        $rootScope.toggleMenu();
        $rootScope.busy(true);

        $rootScope.user = auth.logout();
        $rootScope.user.$then(
            function(){
                console.log($rootScope.user);
                $rootScope.busy(false);
                $location.url('/client/login');
            },
            function(){
                $rootScope.busy(false);
                $location.url('/client/login');
            }
        )
    }

    $rootScope.getThumbUrl = function(media){
        if(media['has_thumb']) {
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

})
.factory('Users', function($resource) {
    return $resource('/users/', {}, {
        all: {
            method: 'GET',
            isArray: true
        },
        user : {
            method: 'GET',
            url : '/users/user'
        },
        login : {
            method : 'POST',
            url : '/users/login',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        },
        logout : {
            method: 'GET',
            url : '/users/logout'
        }
    });
})
.factory('Projects', function($resource) {
    return new GenericResource($resource, '/projects/:id', {id:'@id'}, {
        all: {
            method: 'GET',
            isArray: true
        },
        get: {
            method: 'GET'
        }
    });
})
.service('auth', function(Users){

    this.auth = function(username, password){
        var xsrf = $.param({
            "data[User][username]" : username,
            "data[User][password]" : password
        });
        return Users.login(xsrf);

    }

    this.logout = function() {
        return Users.logout();
    }

    this.user = function() {
        return Users.user();
    }

});

function OLDAlCtrl($scope, $rootScope, $location, $routeParams, $resource, $filter, auth, DialogService, WindDims) {

    if($rootScope.alMode == null) {
        var MODES = $resource('/activity_logs/modes');
        $rootScope.alModes = MODES.get({}, function(){
            $rootScope.alMode = $rootScope.alModes['default'];
        });
    }

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
        $scope.activityLogs = ALs.query({mode:$rootScope.alMode}, function(){});

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
            $scope.activityLogs = ALs.query({mode:$rootScope.alMode}, function(){});

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
            $scope.activityLogs = ALs.query({mode:$rootScope.alMode}, function(){});
        }

        $scope.updateMode = function(){
            // Necessary because the select/option doesn't update $rootScope.alMode
            $rootScope.alMode = $scope.alMode;
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

function OLDLoginCtrl($scope, $location, $http, auth) {

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


function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function GenericResource(resource, uri, def, config) {
    this.res = resource(uri, def, config);

    this.all = function(params) {
        return this.call('all', params);
    }
    this.get = function(params) {
        return this.call('get', params);
    }
    this.call = function(method, passed) {
        var params = {};
        var payload = {};
        var callbacks = {};
        if(passed != null) {
            if(passed.params != null) { params = passed.params; }
            if(passed.payload != null) { payload = passed.data; }
            if(passed.callbacks != null) { callbacks = passed.callbacks; }
        }
//        console.log(this.res[method]);return;
        return this.res[method](
            params,
            payload,
            function(data, headers){
                if(callbacks != null) {
                    if(callbacks.first != null && data.length > 0) {
                        var ret = callbacks.first(data[0], headers);
                        if(ret != null) {
                            data[0] = ret;
                        }
                    }
                    if(callbacks.even != null) {
                        for(var i=0; i<data.length; i+=2) {
                            var ret = callbacks.even(data[i], headers);
                            if(ret != null) {
                                data[i] = ret;
                            }
                        }
                    }
                    if(callbacks.odd != null) {
                        for(var i=1; i<data.length; i+=2) {
                            var ret = callbacks.odd(data[i], headers);
                            if(ret != null) {
                                data[i] = ret;
                            }
                        }
                    }
//                    if(callbacks.each != null) {
                        console.log(data.length);
                        for(var i=0; i<data.length; i++) {
                            var ret = callbacks.each(data[i], headers);
                            if(ret != null) {
                                data[i] = ret;
                            }
                        }
//                    }
                    if(callbacks.last != null && data.length > 0) {
                        var ret = callbacks.last(data[data.length - 1], headers);
                        if(ret != null) {
                            data[data.length - 1] = ret;
                        }
                    }
                    if(callbacks.success != null) {
                        callbacks.success(data, headers);
                    }
                }
            },
            function(err) {
                if(callbacks != null && callbacks.error) {
                    callbacks.error(err);
                }
            }
        );
    }
}