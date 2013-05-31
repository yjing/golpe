app.factory('media_db', function(database){
    return new function(){
        this.insertMedia = function(media, target_type, target_id) {
            var ret = [];
            if(angular.isArray(media)) {
                for (var i = 0; i < media.length; i++) {
                    ret.push(this.insertMedium(media[i], target_type, target_id));
                }
            }
            return ret;
        }
        this.insertMedium = function(medium, target_type, target_id) {
            var status = 'partial';
            if(angular.isDefined(medium['filename'])) {
                status = 'complete';
            }

            if(angular.isDefined(medium['User'])) {
                var user = users_db.insertUser(medium['User']);
                medium.user = user;
                delete medium['User'];
            }

            if(target_type == 'al') {
                medium.activity_log_id = target_id;
            } else if (target_type == 'comment') {
                medium.comment_id = target_id;
            }

            medium.status = status;
            return database.insert('media', medium['id'], medium);
        }
    }
}).service('media', function(resources){

});
