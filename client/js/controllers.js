function LoginCtrl($scope, $rootScope, $location, auth, BusyService) {
    // TMP CREDENTIALS
    $scope.username = "y.jing";
    $scope.password = "30071980";

    // TOP BAR
    $rootScope.top_bar = {
//        back_button: {
//            icon: 'icon-chevron-left'
//        },
        page_title: 'Login',
//        buttons: [
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' },
//            { type: 'divider-vertical' },
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' }
//        ],
        main_menu_items: [
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };

    $scope.login = function() {
        BusyService.busy(true);
        $rootScope.user = auth.auth($scope.username, $scope.password);
        $rootScope.user.$then(
            function(){
                console.log($rootScope.user);
                BusyService.busy(false);
                if( $rootScope.user['logged'] ) {
                    $scope.redirectUser();
                } else {
                    $scope.login_message = "Login failed";
                }
            },
            function(){
                BusyService.busy(false);
                $scope.login_message = "Login failed";
            }
        )
    }

    $scope.redirectUser = function() {
        if($rootScope.user['logged']) {
            switch ($rootScope.user['User']['role']) {
                case 'STUDENT':
                    $location.url('/client/student');
                    break;
                case 'SUPERVISOR':
                    $location.url('/client/supervisor');
                    break;
                case 'ADMIN':
                    $location.url('/client/users');
                    break;
            }
        }
    }

    BusyService.busy(true);
    $rootScope.user = auth.user();
    $rootScope.user.$then(function(){
        BusyService.busy(false);
        $scope.redirectUser();
    });

}

function UsersCtrl($scope, $rootScope, $location, Users, auth, BusyService) {
    // TOP BAR
    $rootScope.top_bar = {
//        back_button: {
//            icon: 'icon-chevron-left'
//        },
        page_title: 'Users',
        title_icon: 'icon-th-list',
        title_menu: [
            {
                label: 'Projects',
                func: function() {
                    $rootScope.toggleTitleMenu();
                    $location.url('/client/projects');
                }
            }
        ],
//        buttons: [
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' },
//            { type: 'divider-vertical' },
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' }
//        ],
        main_menu_items: [
            { type: 'item', label: 'Log Out', func: $rootScope.logout, icon: 'icon-lock' },
            { type: 'divider' },
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };


    BusyService.busy(false);
    $scope.main = function() {
        BusyService.busy(true);
        $scope.users = Users.all();
        $scope.users.$then(function(){
            BusyService.busy(false);
        });
    }

    if($rootScope.user == null || !$rootScope.user['logged']) {
        BusyService.busy(true);
        $rootScope.user = auth.user();
        $rootScope.user.$then(function(){
            BusyService.busy(false);
            if(!$rootScope.user['logged']) {
                $location.url('/client/login');
            } else {
                $scope.main();
            }
        });
    } else {
        $scope.main();
    }
}

function ProjectsCtrl($scope, $rootScope, $location, $resource, auth, Projects, ProjectsService, Users, BusyService, DBService) {

    // TOP BAR
    $rootScope.top_bar = {
//        back_button: {
//            icon: 'icon-chevron-left'
//        },
        page_title: 'Projects',
        title_icon: 'icon-th-list',
        title_menu: [
            {
                label: 'Users',
                func: function() {
                    $rootScope.toggleTitleMenu();
                    $location.url('/client/users');
                }
            }
        ],
//        buttons: [
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' },
//            { type: 'divider-vertical' },
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' }
//        ],
        main_menu_items: [
            { type: 'item', label: 'Log Out', func: $rootScope.logout, icon: 'icon-lock' },
            { type: 'divider' },
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };

    // PAGE MENU
    $scope.menu = [];
    // CONSTANTS
    var ACTIVE = "active";
    var NOT_ACTIVE = "";
    // PROJECT SELECTION
    $scope.selected_project = null;
    $scope.isSelectedProject = function(id){
        return ( id == $scope.selected_project ? ACTIVE : NOT_ACTIVE );
    }

    // MAIN METHOD
    $scope.main = function() {
        ProjectsService.loadAll(
            // SUCCESS
            function(data, handlers){
                $scope.setupMenu(data);
                if($scope.menu.length > 0) {
                    $scope.selectProject($scope.menu[0].id);
                }
            },
            // ERROR
            function(error){
                $rootScope.handleError(error);
            }
        );
    }

    // BEFORE MAIN: CHECK USER LOGIN
    if($rootScope.user == null || !$rootScope.user['logged']) {
        BusyService.busy(true);
        $rootScope.user = auth.user();
        $rootScope.user.$then(function(){
            BusyService.busy(false);
            if(!$rootScope.user['logged']) {
                $location.url('/client/login');
            } else {
                $scope.main();
            }
        });
    } else {
        $scope.main();
    }

    // SCOPE FUNCTIONS
    $scope.reloadProjects = function(){
        ProjectsService.loadAll(
            true,
            // SUCCESS
            function(data, handlers){
                $scope.setupMenu(data);
            },
            // ERROR
            function(error){
                $rootScope.handleError(error);
            }
        );
    }

    $scope.selectProject = function(id) {
        if(angular.isDefined(DBService.d.projects[id])) {
            ProjectsService.load(id,
                function(d, h){
                    $scope.selected_project = id;

                    var test = ".Project.Team.Student";
                    console.log(test.split('.').splice(0, 1));
                    console.log(test);

                    var newMenu = [];
                    var index = $scope.findIndexById(id);
                    if(angular.isUndefined(index)) {
                        $scope.menu.push({"id":id});
                        index = $scope.menu.length - 1;
                    }
                    if(angular.isDefined(d['Project']['Team']) && angular.isArray(d['Project']['Team'])) {
                        $scope.menu[index].teams = [];
                        for(var i=0; i<d['Project']['Team'].length; i++) {
                            $scope.menu[index].teams.push({"id" : d['Project']['Team'][i].id});
                            if (angular.isArray(d['Project']['Team'][i]['Student'])) {
                                $scope.menu[index].teams[i].users = [];
                                for(var j=0; j<d['Project']['Team'][i]['Student'].length; j++) {
                                    $scope.menu[index].teams[i].users.push({ "id": d['Project']['Team'][i]['Student'][j].id });
                                }
                            }
                        }
                        console.log($scope.menu);
                    }
                },
                function(e) {
                    $rootScope.handleError(e);
                }
            );
        }
    }

    $scope.editProject = function(id) {
        if(angular.isDefined(DBService.d.projects[id])) {
            DBService.m.projects[id].old = angular.copy(DBService.d.projects[id]);
            DBService.m.projects[id].mode = 'edit';
        }
    }

    $scope.cancelEditProject = function(id) {
        if(angular.isDefined(DBService.d.projects[id])) {
            if(DBService.m.projects[id].mode == 'edit') {
                DBService.m.projects[id].mode = 'normal';
                if(angular.isDefined(DBService.m.projects[id].old)) {
                    DBService.d.projects[id] = DBService.m.projects[id].old;
                    delete DBService.m.projects[id].old;
                }
            }
        }
    }

    // UTIL FUNCTIONS
    $scope.setupMenu = function(data) {
        var menu = [];
        if(angular.isArray(data)) {
            for(var i=0; i<data.length; i++) {
                menu.push({id:data[i]['Project']['id']});
            }
        }
        $scope.menu = menu;
        return menu;
    }

    $scope.findIndexById = function(id){
        for(var i=0; i<$scope.menu.length; i++) {
            if (id == $scope.menu[i].id) return i;
            return null;
        }
    }

    $scope.goUsers = function(){
        $location.url('/client/users');
        $rootScope.toggleTitleMenu();
    }

    $scope.saveProject = function(index){
        ProjectsService.save(index,
            function(d, h){

            },
            function (e) {
                $rootScope.handleError(e);
            }
        );
    }

    $scope.showUser = function(user){

        $scope.userinfo = user;
        BusyService.busy(true);
        var u = Users.get({id:user.id},
            function(d){
                BusyService.busy(false);
                $scope.userinfo = u.User;
            },
            function(s){
                BusyService.busy(false);
                $rootScope.handleError(e);
            }
        );
    }

    $scope.disableNewTeamButton = false;
    $scope.newTeamLabel = "Add team";
    $scope.newTeamName = null;
    $scope.newTeamB = false;
    $scope.newTeamPID = null;
    $scope.addTeam = function(p_id){
        if($scope.newTeamB) {
            $scope.disableNewTeamButton = true;
            ProjectsService.addTeam(
                p_id, $scope.newTeamName,
                function(d, h){
                    ProjectsService.load(ProjectsService.active_project_id,
                        function(d, h){
                            $scope.disableNewTeamButton = false;
                        }
                    );
                },
                function(e) {
                    $rootScope.handleError(e);
                }
            );
            $scope.newTeamLabel = "Add team";
            $scope.newTeamName = null;
            $scope.newTeamB = false;
            $scope.newTeamPID = null;
        } else {
            $scope.newTeamLabel = "Add";
            $scope.newTeamName = 'New Team';
            $scope.newTeamB = true;
            $scope.newTeamPID = p_id;
        }
    }

    $scope.t_id = null;
    $scope.students = null;
    $scope.addStudent = function(t_id){
        $scope.t_id = t_id;
        BusyService.busy(true);
        $scope.students = Users.all(
            function(data){
                BusyService.busy(false);
                console.log($scope.students);
            },
            function(err_data){
                $rootScope.handleError(err_data);
                BusyService.busy(false);
            }
        );
    }
    $scope.add = function(t_id, s_id){

        $scope.projects[$scope.p_index].Team.

        BusyService.busy(true);
        var Test = $resource('/teams/addMember/:tid/:sid',{},{
            add: {
                method: 'POST'
            }
        });
        Test.add({tid:t_id, sid:s_id},{},
            function(data){
                BusyService.busy(false);
                console.log(data);
            },
            function(err){
                BusyService.busy(false);
                console.log(err);
            }
        );
    }

    $scope.isActive = function(index) {
        if(index == $scope.p_index) {
            return 'active';
        }
    }

    $scope.description_active = 'active';
    $scope.teams_active = '';
    $scope.showTeams = function() {
        $scope.description_active = '';
        $scope.teams_active = 'active';
    }
    $scope.showDescription = function() {
        $scope.description_active = 'active';
        $scope.teams_active = '';
    }
}