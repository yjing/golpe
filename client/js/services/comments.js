app.factory('comments_db', function(database, media_db, users_db){
    return new function(){
        this.insertComments = function(comments, target_id) {
            var ret = [];
            if(angular.isArray(comments)) {
                for (var i = 0; i < comments.length; i++) {
                    ret.push(this.insertComment(comments[i], target_id));
                }
            }
            return ret;
        };
        this.insertComment = function(comment, target_id) {
            if(angular.isDefined(comment['Media'])) {
                if(angular.isArray(comment['Media']) && comment['Media'].length > 0) {
                    var media = media_db.insertMedia(comment['Media'], 'comment', comment['id']);
                    comment.media = media;
                }
                delete comment['Media'];
            }
            if(angular.isDefined(comment['User'])) {
                var user = users_db.insertUser(comment['User']);
                comment.user = user;
                delete comment['User'];
            }

            comment.activity_log_id = target_id;
            return database.insert('comments', comment['id'], comment);
        };
    };
}).service('comments', function(resources){

});
