app.service('auth', function(resources){

    var logged_user;
    
    this.user = function(callback){
        resources.Users.user(
            function(d, h){
                console.log(d);
            },
            function(e){
                console.log("ERROR:");
                console.log(e);
            }
        );
    }


});
