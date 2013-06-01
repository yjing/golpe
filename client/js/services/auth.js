app.service('auth', function($rootScope, resources, busy){

    var logged_user;
    
    this.user = function(callback){
        if(angular.isUndefined(logged_user)) {
            busy.busy(true);
            resources.Users.user(
                function(d, h){
                    busy.busy(false);
                    if(d.logged) {
                        logged_user = d.User;
                    } else {
                        logged_user = null;
                    }
                    if(angular.isDefined(callback)) {
                        callback(logged_user);
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
            callback(logged_user);
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
                    logged_user = d.User;
                } else {
                    logged_user = null;
                }
                if(angular.isDefined(callback)) {
                    callback(logged_user);
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
                    logged_user = null;
                } else {
                    logged_user = d.User;
                }
                if(angular.isDefined(callback)) {
                    callback(logged_user);
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
