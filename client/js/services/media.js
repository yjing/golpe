app.factory('media_db', function(database){
    return new function(){
        this.insertMedia = function(media, target_id) {
            var ret = [];
            if(angular.isArray(media)) {
                for (var i = 0; i < media.length; i++) {
                    ret.push(this.insertMedium(media[i], target_id));
                }
            }
            return ret;
        }
        this.insertMedium = function(medium, target_type, target_id) {
            medium.status = 'partial';
            if(target_type == 'al') {
                medium.activity_log_id = target_id;
            } else if (target_type == 'comment') {
                medium.comment_id = target_id;
            }
            return database.insert('media', medium['id'], medium);
        }
    }
}).service('media', function(resources){

});
