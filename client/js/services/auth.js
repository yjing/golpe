app.service('auth', function(resources){

    var logged_user;
    
    this.user = function(callback){
        if(angular.isUndefined(logged_user)) {
            resources.Users.user(
                function(d, h){
                    console.log("LOADED");
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


});
