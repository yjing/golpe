app.factory('comments_db', function(database, users_db){
    return new function(){
        this.insertComments = function(comments, target_id) {
            var ret = [];
            if(angular.isArray(comments)) {
                for (var i = 0; i < comments.length; i++) {
                    ret.push(this.insertComment(comments[i], target_id));
                }
            }
            return ret;
        }
        this.insertComment = function(comment, target_id) {

            var user;
            if(angular.isDefined(comment['User'])) {
                user = users_db.insertUser(comment['User']);
                comment.user = user;
                delete comment['User'];
            }
            delete comment['Media'];

            comment.activity_log_id = target_id;
            return database.insert('comments', comment['id'], comment);
        }
    }
}).service('comments', function(resources){

});
