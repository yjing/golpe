app.factory('comments_db', function(database){
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
            delete comment['Media'];
            comment.status = 'partial';
            return database.insert('comments', comment['id'], comment);
        }
    }
}).service('comments', function(resources){

});
