app.service('auth', function($rootScope, resources, busy){

    this.user = function(callback){
        if(angular.isUndefined($rootScope.user) || $rootScope.user == null) {
            busy.busy(true);
            resources.Users.user(
                function(d, h){
                    busy.busy(false);
                    if(d.logged) {
                        $rootScope.user = d.User;
                    } else {
                        $rootScope.user = null;
                    }
                    if(angular.isDefined(callback)) {
                        callback($rootScope.user);
                    }
                },
                function(e){
                    busy.busy(false);
                    if(!$rootScope.handleError(e) && angular.isDefined(callback)) {
                        callback(e);
                    }
                }
            );
        } else if(angular.isDefined(callback)) {
            callback($rootScope.user);
        }
    }

    this.login = function (username, password, callback) {
        var xsrf = $.param({
            "data[User][username]":username,
            "data[User][password]":password
        });
        busy.busy(true);
        resources.Users.login(xsrf,
            function(d, h){
                busy.busy(false);
                if(d.logged) {
                    $rootScope.user = d.User;
                } else {
                    $rootScope.user = null;
                }
                if(angular.isDefined(callback)) {
                    callback($rootScope.user);
                }
            },
            function(e){
                busy.busy(false);
                if(!$rootScope.handleError(e) && angular.isDefined(callback)) {
                    callback(e);
                }
            }
        );

    }

    this.logout = function(callback) {
        busy.busy(true);
        resources.Users.logout(
            function(d, h){
                busy.busy(false);
                if(!d.logged) {
                    $rootScope.user = null;
                } else {
                    $rootScope.user = d.User;
                }
                if(angular.isDefined(callback)) {
                    callback($rootScope.user);
                }
            },
            function(e){
                busy.busy(false);
                if(!$rootScope.handleError(e) && angular.isDefined(callback)) {
                    callback(e);
                }
            }
        );
    }

});
