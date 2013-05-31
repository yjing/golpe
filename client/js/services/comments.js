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
}).service('resources', function($resource){

    this.Users = $resource('/projects/:id', { id:'@id' }, {
        all:{
            method:'GET',
            isArray:true
        },
        load:{
            method:'GET',
            isArray:false
        },
        user:{
            method:'GET',
            url:'/users/user'
        },
        login:{
            method:'POST',
            url:'/users/login',
            headers:{'Content-Type':'application/x-www-form-urlencoded'}
        },
        logout:{
            method:'GET',
            url:'/users/logout'
        }
    });

    this.Als = $resource('/activity_logs/:id', { id:'@id' }, {
        all:{
            method:'GET',
            isArray:true
        },
        load:{
            method:'GET',
            isArray:false
        },
        modes:{
            method:'GET',
            url:'/activity_logs/modes'
        }
    });

});
