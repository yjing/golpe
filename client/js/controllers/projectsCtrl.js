function ProjectsCtrl($scope, $rootScope, $routeParams, $location, $dialog, auth, database, projects, users, teams){
    // TOP BAR
    $scope.setupTopBar = function () {
        $rootScope.top_bar = {
            page_title:'Projects',
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

    auth.user(
        function (user) {

            if(angular.isUndefined(user) || user == null) {
                $rootScope.redirectAfterLogin = $location.url();
                $location.url('/client/login');
                return;
            }


            if (angular.isDefined($scope.selected_p_id) && $scope.selected_p_id != null) {
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

            projects.all(
                false,               // RELOAD
                function(d, h) {     // SUCCESS
                    $scope.data = database.select('projects',[], 3);
                }
            );
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

    $scope.selectedP = function (id) {
        return $scope.selected_p_id == id ? 'active' : '';
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
//    var msgbox = $dialog.messageBox('Delete Item', 'Are you sure?', [{label:'Yes, I\'m sure', result: 'yes'},{label:'Nope', result: 'no'}]);
//    msgbox.open().then(function(result){
//        if(result === 'yes') {deleteItem(item);}
//    });

    // Inlined template for demo
    var new_team_t = '<div class="modal-header">'+
        '<h1>New Team</h1>'+
        '</div>'+
        '<div class="modal-body">'+
        '<p>Name: <input ng-model="result" /></p>'+
        '</div>'+
        '<div class="modal-footer">'+
        '<button ng-click="closeNewTeam()" class="btn btn-primary" >Cancel</button>'+
        '<button ng-click="closeNewTeam(result)" class="btn btn-primary" >Create</button>'+
        '</div>';

    $scope.opts = {
        backdrop: true,
        keyboard: true,
        backdropClick: true
    };

    $scope.dialog_nt = null;

    $scope.newTeam = function(){
        $scope.opts.template = new_team_t;
        $scope.opts.controller = 'NewItemDCtrl';
        var d = $dialog.dialog($scope.opts);
        d.open().then(function(result){
            if(angular.isDefined(result)) {
                var team = {
                    name: result,
                    project_id: $scope.selected_p_id
                }
                teams.save(team,
                    function(d, h){
                        var t_id = d['Team'].id;
                        $scope.selected_t = database.select('teams', [ {field:'id',value:t_id} ], 3)[0];
                        if($scope.add_member) {
                            $scope.setMemberList();
                        }
                    }
                );
            }
        });
    };
}

function NewItemDCtrl($scope, dialog){
    $scope.closeNewTeam = function(result){
        dialog.close(result);
    };
}