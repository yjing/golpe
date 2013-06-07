app.service('resources', function($resource){

    this.Users = $resource('/users/:id', { id:'@id' }, {
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
        },
        assignSupervisor: {
            method:'POST',
            url:'/users/assignSupervisor/:uid/:sid'
        }
    });

    this.Als = $resource('/activity_logs/:id', { id:'@id' }, {
        all:{
            method:'GET',
            isArray:true
        },
        get:{
            method:'GET',
            isArray:false
        },
        modes:{
            method:'GET',
            url:'/activity_logs/modes'
        }
    });

    this.Projects = $resource('/projects/:id', { id:'@id' }, {
        all:{
            method:'GET',
            isArray:true
        },
        load:{
            method:'GET',
            isArray:false
        }
    });

    this.Teams = $resource('/teams/:id', { id:'@id' }, {
//        delete:{
//            url: '/teams/:id',
//            method:'DELETE'
//        },
        addMember:{
            url:'/teams/addMember/:tid/:uid',
            method:'POST'
        },
        removeMember:{
            url:'/teams/removeMember/:tid/:uid',
            method:'DELETE'
        }
    });

});
