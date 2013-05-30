app.service('auth', function(resources){

    var logged_user;
    
    this.user = function(callback){
        if(angular.isUndefined(logged_user)) {
            resources.Users.user(
                function(d, h){
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
                    console.log("ERROR:");
                    console.log(e);
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
        resources.Users.login(xsrf,
            function(d, h){
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
                console.log("ERROR:");
                console.log(e);
            }
        );

    }

    this.logout = function(callback) {
        resources.Users.logout(
            function(d, h){
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
                console.log("ERROR:");
                console.log(e);
            }
        );
    }

});
