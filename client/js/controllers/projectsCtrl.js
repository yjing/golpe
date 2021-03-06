function ProjectsCtrl($scope, $rootScope, $routeParams, $location, $dialog, auth, database, projects, users, teams){
    // TOP BAR
    $scope.setupTopBar = function () {
        $rootScope.top_bar = {
            page_title:'Projects',
            title_menu: [ { label: 'Users', func: function(){ $location.url('/client/users') } } ],
            main_menu_items:[
                { type:'item', label:'Logout', icon:'icon-lock', func:$rootScope.logout },
                { type:'item', label:'Help', icon:'icon-question-sign', func:$rootScope.help },
                { type:'item', label:'Info', icon:'icon-info-sign', func:$rootScope.info }
            ]
        };
    }

    $scope.setupTopBar();

    $scope.data = [];
    $scope.selected_p_id = $routeParams.id;
    $scope.selected_p = null;
    $scope.selected_p_edit = null;
    $scope.edit_p = false;
    $scope.delete_p = false;

    $scope.selected_t_id = $routeParams.tid;
    $scope.selected_t = null;
    $scope.edit_t = false;
    $scope.delete_t = false;

    $scope.member_list = null;
    $scope.add_member = false;

    $scope.$watch('add_member', function(){
        if($scope.add_member) {
            $scope.setMemberList();
        } else {
            $scope.member_list = null;
        }
    });

    $scope.setMemberList = function () {
        $scope.member_list = $scope.filterTeamedStudents(database.select('users', [ {field:'role',value:'STUDENT'} ], 1));
    };

    $scope.filterTeamedStudents = function(students) {
        var list = [];
        for (var i = 0; i < students.length; i++) {
            if(angular.isUndefined(students[i].team_id) || students[i].team_id == null){
                list.push(students[i]);
            }

        }
        return list;
    }

    $scope.loadAll = function (reload) {
        if (angular.isDefined($scope.selected_p_id) && $scope.selected_p_id != null) {
            if($scope.selected_p_id == 'new') {
                $scope.selected_p = {};
            } else {
                projects.load(
                    $scope.selected_p_id,
                    function (d, h) {    // SUCCESS
                        $scope.selected_p = database.select('projects', [ {field:'id',value:$scope.selected_p_id} ], 3)[0];
                        users.all(false,
                            function(d, h){
                                if(angular.isDefined($scope.selected_t_id) && $scope.selected_t_id) {
                                    $scope.selected_t = database.select('teams', [ {field:'id',value:$scope.selected_t_id} ], 3)[0];
                                }
                            }
                        );
                    }
                );
            }
        }

        projects.all(
            reload,               // RELOAD
            function(d, h) {     // SUCCESS
                $scope.data = database.select('projects',[], 3);
            }
        );
    };

    auth.user(
        function (user) {

            if(angular.isUndefined(user) || user == null) {
                $rootScope.redirectAfterLogin = $location.url();
                $location.url('/client/login');
                return;
            }

            $scope.loadAll(false);
        }
    );

    $scope.go = function(id, t_id){
        var url = '/client/projects';
        if (angular.isDefined(id)) {
            url += '/' + id;
        }
        if (angular.isDefined(t_id)) {
            url += '/' + t_id;
        }
        $location.url(url);
    };

    $scope.saveP = function () {
        projects.save(
            $scope.selected_p,
            function(d, h) {    // SUCCESS
                $scope.data = database.select('projects',[], 3);
                if($scope.selected_p_id == 'new') {
                    $scope.go(d['Project'].id);
                } else {
                    $scope.unEditSelectedP();
                }
            }
        );
    };

    $scope.deleteP = function () {
        projects.delete(
            $scope.selected_p_id,
            function(d, h) {    // SUCCESS
                $scope.go();
            }
        );
    };

    $scope.selectedP = function (id) {
        return $scope.selected_p_id == id ? 'active' : '';
    };

    $scope.editSelectedP = function () {
        $scope.edit_p = true;
    };

    $scope.unEditSelectedP = function () {
        $scope.selected_p = database.select('projects', [ {field:'id',value:$scope.selected_p_id} ], 3)[0];
        $scope.edit_p = false;
    };

    $scope.selectedT = function (id) {
        return $scope.selected_t_id == id ? 'active' : '';
    };

    $scope.removeMember = function(t_id, u_id){
        teams.removeMember(
            t_id,
            u_id,
            function(d, h) {    // SUCCESS
                $scope.selected_t = database.select('teams', [ {field:'id',value:$scope.selected_t_id} ], 3)[0];
                if($scope.add_member) {
                    $scope.setMemberList();
                }
            }
        );
    };

    $scope.addMember = function(t_id, u_id){
        teams.addMember(
            t_id,
            u_id,
            function(d, h) {    // SUCCESS
                $scope.selected_t = database.select('teams', [ {field:'id',value:$scope.selected_t_id} ], 3)[0];
                if($scope.add_member) {
                    $scope.setMemberList();
                }
            }
        );
    };

    $scope.new_team_t = '<div class="modal-header">'+
        '<h1>New Team</h1>'+
        '</div>'+
        '<div class="modal-body">'+
        '<p>Name: <input ng-model="result" autofocus="true" onload="focus()" /></p>'+
        '</div>'+
        '<div class="modal-footer">'+
        '<button ng-click="close()" class="btn btn-primary" >Cancel</button>'+
        '<button ng-click="close(result)" class="btn btn-primary" >Create</button>'+
        '</div>';
    $scope.edit_team_t = '<div class="modal-header">'+
        '<h1>Edit Team Name</h1>'+
        '</div>'+
        '<div class="modal-body">'+
        '<p>Name: <input ng-model="result" autofocus="true" onload="focus()" /></p>'+
        '</div>'+
        '<div class="modal-footer">'+
        '<button ng-click="close()" class="btn btn-primary" >Cancel</button>'+
        '<button ng-click="close(result)" class="btn btn-primary" >Create</button>'+
        '</div>';

    $scope.opts = {
        backdrop: true,
        keyboard: true,
        backdropClick: true
    };

    $scope.newTeam = function(){
        var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            template: $scope.new_team_t,
            controller: 'DialogCtrl'
        };
        var d = $dialog.dialog(opts);
        d.open().then(function(result){
            if(angular.isDefined(result)) {
                var team = {
                    name: result,
                    project_id: $scope.selected_p_id
                }
                teams.save(team,
                    function(d, h){
                        var t_id = d['Team'].id;
                        $scope.go($scope.selected_p_id, t_id);
                    }
                );
            }
        });
    };

    $scope.editTeam = function () {
        var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            template: $scope.edit_team_t,
            controller: 'DialogCtrl'
        };
        $rootScope.result = $scope.selected_t.name;
        var oldN = $scope.selected_t.name;

        var d = $dialog.dialog($scope.opts);
        d.open().then(function(result){
            if(angular.isDefined(result) && result != oldN) {
                $scope.selected_t.name = result;
                teams.save(
                    $scope.selected_t,
                    function(d, h){
                        $scope.selected_p = database.select('projects', [ {field:'id',value:$scope.selected_p_id} ], 3)[0];
                        $scope.selected_t = database.select('teams', [ {field:'id',value:$scope.selected_t_id} ], 3)[0];
                    }
                );
            }
        });
    };

    $scope.deleteT = function () {
        teams.delete(
            $scope.selected_t_id,
            function(d, h) {    // SUCCESS
                $scope.go($scope.selected_p_id);
            }
        );
    };

}

function DialogCtrl($scope, dialog){
    $scope.close = function(result){
        dialog.close(result);
    };
}