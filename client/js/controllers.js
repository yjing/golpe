// CONSTANTS
var ACTIVE = "active";
var NOT_ACTIVE = "";

function LoginCtrl($scope, $rootScope, $location, auth, BusyService) {
    // TMP CREDENTIALS
    $scope.username = "s.susini";
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

function UsersCtrl($scope, $rootScope, $location, Users, auth, UsersService, BusyService, database) {
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

    $scope.new_user_id = -1;
    $scope.new_user = null;
    $scope.selected_user = null;
    $scope.meta = {};

    $scope.main = function() {
        UsersService.loadAll(
            // SUCCESS
            function(d, h){
                var data = database.select(UsersService.TABLE, [], 2);
                for (var i = 0; i < data.length; i++) {
                    if(i==0) {
                        $scope.selected_user = data[i][UsersService.PKEY];
                    }
                    $scope.meta[data[i][UsersService.PKEY]] = { index: i };
                    $scope.meta[data[i][UsersService.PKEY]][MODE_KEY] = MODE_NORMAL;
                }
                $scope.usersData = data;
            },
            // ERROR
            function(error){
                $rootScope.handleError(error);
            }
        );
    }
    $scope.setupMenu = function () {
        $scope.usersData  = database.select(UsersService.TABLE, [], 1);
        for (var i = 0; i < $scope.usersData.length; i++) {
            $scope.meta[$scope.usersData[i]['id']] = { index: i };
        }
    };

    $scope.user = function (id) {
        if(angular.isDefined(id) && id != null) {
            if(id > 0) {
                var index = $scope.meta[id].index;
                return $scope.usersData[index];
            } else {
                return $scope.new_user;
            }
        }
    };
    $scope.newUser = function () {
        $scope.new_user = {};
        $scope.selected_user = $scope.new_user_id;
    };
    $scope.cancelNewUser = function () {
        $scope.new_user = null;
        if($scope.selected_user == $scope.new_user_id) {
            $scope.selected_user = null;
        }
    };
    $scope.isNewUser = function () {
        return $scope.new_user != null;
    };
    $scope.selectUser = function (id) {
        if(angular.isDefined(id)) {
            $scope.selected_user = id;
        }
    };
    $scope.isSelectedUser = function (id) {
        if(angular.isDefined(id)) {
            return (id == this.selected_user ? 'active' : '');
        }
    };
    $scope.editUser = function (id) {
        if(angular.isDefined(id)) {
            var index = $scope.meta[id].index;
            $scope.meta[id][MODE_KEY] = MODE_EDIT;
            $scope.meta[id].old = angular.copy($scope.usersData[index]);
        }
    };
    $scope.cancelEditUser = function (id) {
        if(angular.isDefined(id)) {
            var index = $scope.meta[id].index;
            $scope.meta[id][MODE_KEY] = MODE_NORMAL;
            $scope.usersData[index] = $scope.meta[id].old;
        }
    };
    $scope.saveUser = function (id) {
        if(angular.isDefined(id)) {
            var index = $scope.meta[id].index;
            $scope.meta[id][MODE_KEY] = MODE_NORMAL;
            UsersService.save(
                $scope.usersData[index],
                function(d, h){
                    console.log(d);
                },
                function(e){
                    $rootScope.handleError(error);
                }
            );
        }
    };
    $scope.isEditUser = function (id) {
        if(angular.isDefined(id) && id != null) {
            if(id == $scope.new_user_id) {
                return false;
            } else {
                return $scope.meta[id].mode == MODE_EDIT;
            }
        }
    };
    $scope.deleteUser = function (confirm, id) {
        if(confirm) {

        } else {
            $scope.meta[id][MODE_KEY] = MODE_DELETING;
        }
    };
    $scope.cancelDeleteUser = function (id) {
        if(angular.isDefined(id)) {
            $scope.meta[id][MODE_KEY] = MODE_NORMAL;
        }
    };
    $scope.isDeleteUser = function (id) {
        if(angular.isDefined(id)) {
            return $scope.meta[id].mode == MODE_DELETING;
        }
    };
    $scope.reloadUsers = function () {
        UsersService.loadAll(
            // SUCCESS
            function(d, h){
                $scope.setupMenu();
            },
            // ERROR
            function(error){
                $rootScope.handleError(error);
            }
        );
    };

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

function ProjectsCtrl($scope, $rootScope, $location, auth, BusyService, ProjectsService, database){
    var _THIS = this;
    $scope.elements = [];
    $scope.selected_elem = null;
    $scope.new_elem_id = -1;
    $scope.new_elem = null;

    // MAIN METHOD
    $scope.main = function() {
        ProjectsService.loadAll(
            // SUCCESS
            function(data, handlers){
                var elems = database.select(ProjectsService.TABLE, [], 3);
                for (var i = 0; i < elems.length; i++) {
                    var elem = elems[i];
                    _THIS.setProjectMeta(elem[ProjectsService.PKEY], MODE_NORMAL);

                }
                $scope.elements = elems;
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

    // PROJECTS RELATED FUNCTIONS
    $scope.elem = function (id) {
        var test = database.get(ProjectsService.TABLE, id, 0);
        return test;
    };
    $scope.selectElem = function (id) {
        $scope.selected_elem = id;
    };
    $scope.isSelectedElem = function (id) {
        return (id == $scope.selected_elem ? 'active' : '');
    };
    $scope.editElem = function (id) {
        _THIS.setProjectMeta(id, MODE_EDIT);
    };
    $scope.cancelEditElem = function (id) {
        _THIS.setProjectMeta(id, MODE_NORMAL);
        $scope.elements = database.select(ProjectsService.TABLE, [], 3);
    };
    $scope.isEditElem = function (id) {
        var meta = _THIS.getProjectMeta(id);
        if(angular.isDefined(meta)) {
            return meta.mode == MODE_EDIT;
        } else {
            return false;
        }
    };
    $scope.deleteElem = function (confirm, id) {
        if(confirm) {
            ProjectsService.delete(id,
                function(d, h){
                    $scope.elements = database.select(ProjectsService.TABLE, [], 3);
                },
                function(e) {
                    $rootScope.handleError(error);
                }
            );
        } else {
            _THIS.setProjectMeta(id, MODE_DELETING);
        }
    };
    $scope.isDeleteElem = function (id) {
        var meta = _THIS.getProjectMeta(id);
        if(angular.isDefined(meta)) {
            return meta.mode == MODE_DELETING
        } else {
            return false;
        }
    };
    $scope.cancelDeleteElem = function (id) {
        _THIS.setProjectMeta(id, MODE_NORMAL);
    };
    $scope.saveElem = function (id) {
        if(angular.isDefined(id)) {
            var data;
            if(id == $scope.new_elem_id) {
                data = $scope.new_elem;
            } else {
                data = $scope.projectsData[index];
                $scope.meta[id][MODE_KEY] = MODE_NORMAL;
            }

            ProjectsService.save(
                data,
                function(d, h){
                    if(angular.isDefined(index)) {

                    } else {
                        id = d['Project']['id'];
                        var new_proj = database.get('Projects', id, 3);

                        $scope.meta[id] = { index: $scope.projectsData.length };
                        $scope.meta[id][MODE_KEY] = MODE_NORMAL;
                        $scope.projectsData.push(new_proj);
                        $scope.cancelNewProject();
                        $scope.selectProject(id);

                    }
                },
                function(e){
                    $rootScope.handleError(error);
                }
            );
        }
    };


    // INTERNAL FUNCTIONS
    this.getProjectMeta = function(id) {
        return database.get('ProjectsMeta', id, 0);
    }
    this.setProjectMeta = function (id, mode) {
        var meta = database.get('ProjectsMeta', id, 0);
        if(angular.isUndefined(meta)) {
            meta = { "id": id, "mode": mode };
        } else {
            meta[MODE_KEY] = mode;
        }
        database.insert('ProjectsMeta', id, meta);
    };

    // TOP BAR
    $rootScope.top_bar = {
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
        main_menu_items: [
            { type: 'item', label: 'Log Out', func: $rootScope.logout, icon: 'icon-lock' },
            { type: 'divider' },
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };
}

function ProjectsCtrlOLD($scope, $rootScope, $location, auth, Projects, ProjectsService, TeamsService, Users, BusyService, database) {

    var METATATBLE = 'Meta';
    database.insert(METATATBLE, 'DB_TABLE_AUTO_ID', {
        type:ProjectsService.DATA_KEY,
        elem_id: '34',
        status: STATUS_PARTIAL,
        mode: MODE_NORMAL
    });
    database.insert(METATATBLE, 'DB_TABLE_AUTO_ID', {
        type:ProjectsService.DATA_KEY,
        elem_id: '3',
        status: STATUS_COMPLETE,
        mode: MODE_EDIT
    });
    database.insert(METATATBLE, 'DB_TABLE_AUTO_ID', {
        type:TeamsService.DATA_KEY,
        elem_id: '34',
        status: STATUS_COMPLETE,
        mode: MODE_NORMAL
    });

    console.log(database.select(METATATBLE, [
        { field:'type', value:ProjectsService.DATA_KEY },
        { field:'elem_id', value:'34' }
    ], 0));

    return;

    // TOP BAR
    $rootScope.top_bar = {
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
        main_menu_items: [
            { type: 'item', label: 'Log Out', func: $rootScope.logout, icon: 'icon-lock' },
            { type: 'divider' },
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };


    $scope.new_project_id = -1;
    $scope.new_project = null;
    $scope.selected_project = null;

    $scope.new_team_id = -1;
    $scope.new_team = null;
    $scope.selected_team = null;

    $scope.meta = {};

    // MAIN METHOD
    $scope.main = function() {
        ProjectsService.loadAll(
            // SUCCESS
            function(data, handlers){
                $scope.setupData(true);
            },
            // ERROR
            function(error){
                $rootScope.handleError(error);
            }
        );
    }

    $scope.setupData = function (after_download) {
        var data = database.select(ProjectsService.TABLE, [], 3);
        if(after_download) {
            $scope.meta = {};
            for (var i = 0; i < data.length; i++) {
                if(i==0) {
                    $scope.selectProject(data[i][ProjectsService.PKEY]);
                }
                $scope.meta[data[i][ProjectsService.PKEY]] = { index: i };
                $scope.meta[data[i][ProjectsService.PKEY]][MODE_KEY] = MODE_NORMAL;
                $scope.meta[data[i][ProjectsService.PKEY]].teams = {};
            }
        }
        $scope.projectsData = data;
    };

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

    $scope.project = function (id) {
        if(angular.isDefined(id) && id != null) {
            if(id > 0) {
                var index = $scope.meta[id].index;
                return $scope.projectsData[index];
            } else {
                return $scope.new_project;
            }
        }
    };
    $scope.isSelectedProject = function (id) {
        if(angular.isDefined(id)) {
            return (id == this.selected_project ? 'active' : '');
        }
    };
    $scope.isSelectedTeam = function (id) {
        if(angular.isDefined(id)) {
            return (id == this.selected_team ? 'active' : '');
        }
    };
    $scope.selectProject = function (id) {
        if(angular.isDefined(id)) {
            ProjectsService.load(id,
                function(d, h) {
                    $scope.selected_project = id;
                    var proj = database.select("Projects", [{field:'id', value:id}], 3)[0];
                    var index = $scope.meta[id].index;
                    $scope.projectsData[index] = proj;

                    if(angular.isDefined(proj.Teams)) {
                        for (var i = 0; i < proj.Teams.length; i++) {
                            var t = proj.Teams[i];
                            $scope.meta[id].teams[t.id] = { index : i };
                            $scope.meta[id].teams[t.id][MODE_KEY] = MODE_NORMAL;
                        }
                    }
                    console.log($scope.meta);

                },
                function(e) {
                    $rootScope.handleError(e);
                }
            );
        }
    };
    $scope.selectTeam = function (id) {
        if(angular.isDefined(id) && id != null) {
            $scope.selected_team = id;
        }
    }
    $scope.editProject = function (id) {
        if(angular.isDefined(id)) {
            var index = $scope.meta[id].index;
            $scope.meta[id][MODE_KEY] = MODE_EDIT;
            $scope.meta[id].old = angular.copy($scope.projectsData[index]);
        }
    };
    $scope.cancelEditProject = function (id) {
        if(angular.isDefined(id)) {
            var index = $scope.meta[id].index;
            $scope.meta[id][MODE_KEY] = MODE_NORMAL;
            $scope.projectsData[index] = $scope.meta[id].old;
        }
    };
    $scope.isEditProject = function (id) {
        if(angular.isDefined(id) && id != null) {
            if(id == $scope.new_project_id) {
                return false;
            } else {
                return $scope.meta[id].mode == MODE_EDIT;
            }
        }
    };
    $scope.isDeleteProject = function (id) {
        if(angular.isDefined(id)) {
            return $scope.meta[id].mode == MODE_DELETING;
        }
    };
    $scope.deleteProject = function (confirm, id) {
        if(confirm) {
            ProjectsService.delete(id,
                function(d, h){
                    console.log($scope.meta);
                    console.log($scope.meta[id]);
                    var index = $scope.meta[id].index;
                    $scope.projectsData.splice(index, 1);
                },
                function(e) {
                    $rootScope.handleError(error);
                }
            );
        } else {
            $scope.meta[id][MODE_KEY] = MODE_DELETING;
        }
    };
    $scope.cancelDeleteProject = function (id) {
        if(angular.isDefined(id)) {
            $scope.meta[id][MODE_KEY] = MODE_NORMAL;
        }
    };
    $scope.newProject = function () {
        $scope.new_project = {};
        $scope.selected_project = $scope.new_project_id;
    };
    $scope.isNewProject = function () {
        return $scope.new_project != null;
    };
    $scope.cancelNewProject = function () {
        $scope.new_project = null;
        if($scope.selected_project == $scope.new_project_id) {
            $scope.selected_project = null;
        }
    };
    $scope.saveProject = function (id) {
        if(angular.isDefined(id)) {
            var data;
            var index;
            if(id == $scope.new_project_id) {
                data = $scope.new_project;
            } else {
                index = $scope.meta[id].index;
                data = $scope.projectsData[index];
                $scope.meta[id][MODE_KEY] = MODE_NORMAL;
            }

            ProjectsService.save(
                data,
                function(d, h){
                    if(angular.isDefined(index)) {

                    } else {
                        id = d['Project']['id'];
                        var new_proj = database.get('Projects', id, 3);

                        $scope.meta[id] = { index: $scope.projectsData.length };
                        $scope.meta[id][MODE_KEY] = MODE_NORMAL;
                        $scope.projectsData.push(new_proj);
                        $scope.cancelNewProject();
                        $scope.selectProject(id);

                    }
                },
                function(e){
                    $rootScope.handleError(error);
                }
            );
        }
    };
    $scope.reloadProjects = function () {
        ProjectsService.loadAll(
            // SUCCESS
            function(d, h){
                $scope.setupData(true);
            },
            // ERROR
            function(error){
                $rootScope.handleError(error);
            }
        );
    };
    $scope.isDeleteTeam = function (id, proj_id) {
        if(angular.isDefined(id)) {
            return $scope.meta[proj_id].teams[id][MODE_KEY] == MODE_DELETING;
        }
    };
    $scope.deleteTeam = function (confirm, id, proj_id) {
        if(confirm) {
            TeamsService.delete(id,
                function(d, h){
                    $scope.setupData(false);
                },
                function(e) {
                    $rootScope.handleError(e);
                }
            );
        } else {
            $scope.meta[proj_id].teams[id][MODE_KEY] = MODE_DELETING;
        }
    };
    $scope.cancelDeleteTeam = function (id, proj_id) {
        if(angular.isDefined(id)) {
            $scope.meta[proj_id].teams[id][MODE_KEY] = MODE_NORMAL;
        }
    };
    $scope.newTeam = function (confirm, proj_id) {
        if(!confirm) {
            $scope.new_team = {};
            $scope.selected_team = $scope.new_team_id;
        } else {
            console.log($scope.new_team);
            $scope.new_team['project_id'] = proj_id;
            TeamsService.save(
                $scope.new_team,
                function(d, h){
                    $scope.setupData(false);
                    var id = d[TeamsService.DATA_KEY][TeamsService.PKEY];
                    $scope.meta[proj_id].teams[id] = { "mode" : MODE_NORMAL};
                },
                function(e){
                    $rootScope.handleError(e);
                }
            );
            $scope.cancelNewTeam();
        }
    };
    $scope.cancelNewTeam = function () {
        $scope.new_team = null;
        $scope.selected_team = null;
    };

}

function ProjectsCtrlOLD($scope, $rootScope, $location, auth, Projects, ProjectsService, Users, BusyService, DBService) {

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

    $scope.selected_project = null;
    $scope.isSelectedProject = function(id){
        return ( id == $scope.selected_project ? ACTIVE : NOT_ACTIVE );
    }
    $scope.new_project = null;
    $scope.selected_team = null;
    $scope.new_team = null;
    $scope.isSelectedTeam = function(id){
        return ( id == $scope.selected_team ? ACTIVE : NOT_ACTIVE );
    }
    $scope.add_member = false;
    $scope.add_member_to = null;

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
                $scope.selectProject($scope.selected_project);
            },
            // ERROR
            function(error){
                $rootScope.handleError(error);
            }
        );
    }

    $scope.selectProject = function(id) {
        if(id == -1){
            $scope.selected_project = id;
        } else if(angular.isDefined(DBService.d.projects[id])) {
            ProjectsService.load(id,
                function(d, h){
                    $scope.selected_project = id;
                    if(angular.isObject(d)) {
                        var newProjectTree = getIdTree(d, "Project.Team.Student", "teams.users");
                        var index = $scope.findProjectIndexById(id);
                        $scope.menu[index] = newProjectTree;
                    }
                },
                function(e) {
                    $rootScope.handleError(e);
                }
            );
        }
    }

    $scope.selectTeam = function(id){
        if(angular.isDefined(id) || angular.isDefined(DBService.d.teams[id].id)) {
            $scope.selected_team = id;
            $scope.cancelAddMember();
        }
    }

    $scope.editProject = function(id) {
        if(angular.isDefined(DBService.d.projects[id])) {
            DBService.m.projects[id].old = angular.copy(DBService.d.projects[id]);
            DBService.m.projects[id].mode = 'edit';
        }
    }

    $scope.cancelEditProject = function(id) {
        if (id < 0) {
            $scope.new_project = null;
            if($scope.menu.length > 0) {
                $scope.selectProject($scope.menu[0].id)
            }
        }else if(angular.isDefined(DBService.d.projects[id])) {
            if(DBService.m.projects[id].mode == 'edit') {
                DBService.m.projects[id].mode = 'normal';
                if(angular.isDefined(DBService.m.projects[id].old)) {
                    DBService.d.projects[id] = DBService.m.projects[id].old;
                    delete DBService.m.projects[id].old;
                }
            }
        }
    }

    $scope.saveProject = function(id){
        var id_data = $scope.new_project;
        if(id > 0) {
            id_data = id;
        }
        ProjectsService.save(id_data,
            function(d, h){
                if(angular.isObject(d)) {
                    $scope.selected_project = d.Project.id;
                    var newProjectTree = getIdTree(d, "Project.Team.Student", "teams.users");
                    var index = $scope.findProjectIndexById(id);

                    if(index != null) {
                        $scope.menu[index] = newProjectTree;
                    } else {
                        $scope.menu.push(newProjectTree);
                        $scope.new_project = null;
                        $scope.selectProject(newProjectTree.id);
                    }
                }

            },
            function (e) {
                $rootScope.handleError(e);
            }
        );
    }

    $scope.newProject = function(){
        $scope.selected_project = -1;
        $scope.new_project = {
            "name": null,
            "description": null
        }
    }

    $scope.deleteProject = function(confirm, id) {
        if(angular.isDefined(DBService.d.projects[id])){
            if(confirm == true) {
                var index = $scope.findProjectIndexById(id);
                ProjectsService.delete(id,
                    function(d, h) {
                        $scope.menu.splice(index, 1);
                        if($scope.menu.length > 0) {
                            $scope.selectProject(0);
                        }
                    },
                    function(e) {
                        $rootScope.handleError(e);
                    }
                );
            } else {
                DBService.m.projects[id].mode = 'deleting';
            }
        }
    }

    $scope.newTeam = function(save) {
        if(typeof save == "boolean") {
            if(save) {
                ProjectsService.saveTeam(
                    { "Team": $scope.new_team },
                    function(d,h) {
                        $scope.cancelNewTeam();
                        DBService.m.projects[d['Team']['project_id']].status = 'partial';
                        $scope.selectProject(d['Team']['project_id']);
                    },
                    function(e) {
                        $rootScope.handleError(e);
                    }
                );
            }
        } else {
            $scope.new_team = {
                'project_id': save,
                'name':''
            };
            $scope.selected_team = -1;
        }
    }
    $scope.cancelNewTeam = function() {
        $scope.new_team = null;
        if($scope.selected_team == -1) {
            $scope.selected_team = null;
        }
    }

    $scope.deleteTeam = function(confirm, id, p_id) {
        if(angular.isDefined(DBService.d.teams[id])){
            if(confirm == true) {
                var index = $scope.findTeamIndexById(p_id, id);
                ProjectsService.deleteTeam(id,
                    function(d, h) {
                        $scope.selected_team = null;
                        DBService.m.projects[p_id].status = 'partial';
                        $scope.selectProject(p_id);
                    },
                    function(e) {
                        $rootScope.handleError(e);
                    }
                );
            } else {
                DBService.m.teams[id].mode = 'deleting';
            }
        }
    }

    $scope.addMember = function(confirm, t_id, u_id) {
        if(confirm == false) {
            $scope.add_member = true;
            $scope.add_member_to = t_id;
        } else {
            ProjectsService.addMember(t_id, u_id,
                function(d,h) {
                    var p_id = d['Team'].project_id;
                    DBService.m.projects[p_id].status = 'partial';
                    $scope.selectProject(p_id);
                },
                function(e) {
                    $rootScope.handleError(e);
                }
            )
        }
    }

    $scope.removeMember = function(confirm, u_id, t_id){
        console.log(DBService.m.users[u_id]);
        if(angular.isDefined(DBService.d.teams[t_id]) && angular.isDefined(DBService.d.users[u_id])){
            if(confirm == true) {
                ProjectsService.removeMember(t_id, u_id,
                    function(d, h) {
                        DBService.m.users[u_id].mode = 'normal';

                        var p_id = d['Team'].project_id;
                        DBService.m.projects[p_id].status = 'partial';
                        $scope.selectProject(p_id);
                    },
                    function(e) {
                        DBService.m.users[u_id].mode = 'normal';
                        $rootScope.handleError(e);
                    }
                );
            } else {
                DBService.m.users[u_id].mode = 'deleting';
            }
        }

    }

    $scope.cancelAddMember = function() {
        $scope.add_member = false;
        $scope.add_member_to = null;
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

    $scope.findProjectIndexById = function(id){
        for(var i=0; i<$scope.menu.length; i++) {
            if (id == $scope.menu[i].id) return i;
        }
        return null;
    }

    $scope.findTeamIndexById = function(project_id, id){
        if(angular.isDefined(project_id) && angular.isDefined(id)) {
            var pIndex = $scope.findProjectIndexById(project_id);
            if(angular.isDefined($scope.menu[pIndex]) && angular.isDefined($scope.menu[pIndex].teams)) {
                for(var i=0; i<$scope.menu[pIndex].teams.length; i++) {
                    if (id == $scope.menu[pIndex].teams[i].id) return i;
                }
            }
        }
        return null;
    }

    $scope.goUsers = function(){
        $location.url('/client/users');
        $rootScope.toggleTitleMenu();
    }

}

function StudentCtrl($scope, $rootScope, $location, auth, BusyService, ALService, DBService){

    // TOP BAR
    $rootScope.top_bar = {
//        back_button: {
//            icon: 'icon-chevron-left'
//        },
        page_title: 'Activity Logs',
        title_icon: 'icon-th-list',
//        title_menu: [
//            {
//                label: 'Users',
//                func: function() {
//                    $rootScope.toggleTitleMenu();
//                    $location.url('/client/users');
//                }
//            }
//        ],
        buttons: [
            { type: 'item', label: 'New Activity Log', func: function(){ $scope.al = {}; }, icon: 'icon-plus' }
//            ,{ type: 'divider-vertical' },
//            { type: 'item', label: 'Users', func: $scope.login, icon: 'icon-chevron-left' }
        ],
        main_menu_items: [
            { type: 'item', label: 'Log Out', func: $rootScope.logout, icon: 'icon-lock' },
            { type: 'divider' },
            { type: 'item', label: 'Help', func: $rootScope.help },
            { type: 'item', label: 'Info', func: $rootScope.info }
        ]
    };

    if(false) {
        var iframe = document.getElementById('iframe');
        iframe.addEventListener("load", function(){
    
            // Message from server...
            if (iframe.contentDocument) {
                content = iframe.contentDocument.body.innerHTML;
            } else if (iframe.contentWindow) {
                content = iframe.contentWindow.document.body.innerHTML;
            } else if (iframe.document) {
                content = iframe.document.body.innerHTML;
            }
    
            // Check Result
            var result = $(content).text();
            try {
                result = JSON.parse(result);
            } catch (e) {
                //ERROR
            }
    
            // Refresh DATA
            ALService.loadAll(
                {reload: true, mode:$scope.mode},
                // SUCCESS
                function(data, handlers){
                    BusyService.busy(false);
                    $scope.files = [];
                    $scope.reload();
                    document.getElementById('alform').reset();
                },
                // ERROR
                function(error){
                    $rootScope.handleError(error);
                }
            );
    
        }, true);
    }

    $scope.al = null;
    $scope.files = [];
    $scope.modes = null;
    $scope.mode = null;

    $scope.addFile = function() {
        $scope.files.push({});
    }
    $scope.removeFile = function(index) {
        if (index < $scope.files.length) {
            $scope.files.splice(index, 1);
        }
    }
    $scope.isNewAl = function () {
        return $scope.al != null;
    };
    $scope.hideNewAl = function () {
        $scope.al = null;
    };
    $scope.removeNewAl = function () {
        document.getElementById('alform').reset();
        $scope.hideNewAl();
    };
    $scope.submitNewAl = function () {
        $scope.hideNewAl();
        BusyService.busy(true);
    };

    $scope.question = function (id) {
        if(angular.isDefined(DBService.d.als[id])) {
            return DBService.d.als[id].question ? 'question' : '';
        } else {
            return '';
        }
    };

    $scope.selected_al = null;
    $scope.isSelectedAl = function(id){
        if(angular.isUndefined(id)) return $scope.selected_al != null;
        return ( id == $scope.selected_al ? ACTIVE : NOT_ACTIVE );
    }
    $scope.showInfo = function(id){
        if(angular.isUndefined(id) || id == null) {
            return false;
        } else {
            return DBService.m.als[id].show_info;
        }
    }
    $scope.toggleShowInfo = function(id){
        if(angular.isDefined(id) && angular.isDefined(DBService.m.als[id]) && angular.isDefined(DBService.m.als[id].show_info)) {
            DBService.m.als[id].show_info = ! DBService.m.als[id].show_info;
        }
    }
    $scope.showMedia = function(id){
        if(angular.isUndefined(id) || id == null) {
            return false;
        } else {
            return DBService.m.als[id].show_media;
        }
    }
    $scope.toggleShowMedia = function(id){
        if(angular.isDefined(id) && angular.isDefined(DBService.m.als[id]) && angular.isDefined(DBService.m.als[id].show_media)) {
            DBService.m.als[id].show_media = ! DBService.m.als[id].show_media;
        }
    }
    $scope.showComments = function(id){
        if(angular.isUndefined(id) || id == null) {
            return false;
        } else {
            return DBService.m.als[id].show_comments;
        }
    }
    $scope.toggleShowComments = function(id){
        if(angular.isDefined(id) && angular.isDefined(DBService.m.als[id]) && angular.isDefined(DBService.m.als[id].show_comments)) {
            DBService.m.als[id].show_comments = ! DBService.m.als[id].show_comments;
        }
    }

    // MAIN METHOD
    $scope.main = function() {
        var modes = ALService.modes(
            function(d, h) {
                $scope.modes = d;
                $scope.mode = d.default;

                ALService.loadAll(
                    {reload: false, 'mode':$scope.mode},
                    // SUCCESS
                    function(data, handlers){
                        var menu = [];
                        angular.forEach(DBService.d.als, function(k, v){
                            menu.push(k);
                        });
                        $scope.menu = menu;
                    },
                    // ERROR
                    function(error){
                        $rootScope.handleError(error);
                    }
                );
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

    $scope.reload = function(id) {
        DBService.d.als = {};
        var als = ALService.loadAll(
            {reload: true, 'mode':$scope.mode},
            // SUCCESS
            function(data, handlers){
                var menu = [];
                angular.forEach(DBService.d.als, function(k, v){
                    menu.push(k);
                });
                $scope.menu = menu;

                if(angular.isDefined(DBService.d.als[$scope.selected_al])) {
                    $scope.selectAL($scope.selected_al);
                } else {
                    $scope.selected_al = null;
                }
            },
            // ERROR
            function(error){
                $rootScope.handleError(error);
            }
        );
    }

    $scope.selectAL = function(id) {
        if(id < 0){
            $scope.selected_al = -1;
        } else if(angular.isDefined(DBService.d.als[id])) {
            ALService.load(id,
                function(d, h){
                    $scope.selected_al = id;
                },
                function(e) {
                    $rootScope.handleError(e);
                }
            );
        }
    }

    $scope.saveAl = function(id){
        if(angular.isDefined(DBService.d.als[id])) {
            ALService.save(id,
                function(d, h){
                    if(angular.isObject(d)) {
                        DBService.m.als[id].mode = 'normal';
                    }
                    $scope.reload()
                },
                function (e) {
                    $rootScope.handleError(e);
                }
            );
        }
    }

    $scope.editAl = function (id) {
        if(angular.isDefined(DBService.m.als[id])) {
            DBService.m.als[id].mode = 'edit';
            DBService.m.als[id].old = angular.copy(DBService.d.als[id]);
        }
    };

    $scope.cancelEditAl = function (id) {
        if(angular.isDefined(DBService.m.als[id])) {
            DBService.d.als[id] = DBService.m.als[id].old;
            DBService.m.als[id].mode = 'normal';
        }
    };

    $scope.deleteAl = function(confirm, id) {
        if(angular.isDefined(DBService.d.als[id])){
            if(confirm == true) {
                var index = $scope.findAlIndexById(id);
                ALService.delete(id,
                    function(d, h) {
                        if($scope.selected_al == id) {
                            $scope.selected_al = null;
                        }
                        $scope.reload();
                    },
                    function(e) {
                        $rootScope.handleError(e);
                    }
                );
            } else {
                DBService.m.als[id].mode = 'deleting';
            }
        }
    }

    $scope.download = function (id, dw) {
        if(angular.isDefined(DBService.d.media[id])) {
            var m = DBService.d.media[id];
            if(m['content-type'].indexOf('image/') == 0 && dw != true) {
                window.location.href = '/media/download/' + id;
            } else {
                window.location.href = '/media/download/' + id + '?download=true';
            }
        }
    };

    $scope.startWatching = function () {
        console.log("START W");
        var id = window.setInterval(function(){
            var iframe = document.getElementById('iframe');

            var content;
            // Message from server...
            if (iframe.contentDocument) {
                content = iframe.contentDocument.body.innerHTML;
            } else if (iframe.contentWindow) {
                content = iframe.contentWindow.document.body.innerHTML;
            } else if (iframe.document) {
                content = iframe.document.body.innerHTML;
            }

            console.log(content);
            if(content.length > 0) {
                window.clearInterval(id);

                if (iframe.contentDocument) {
                    iframe.contentDocument.body.innerHTML = "";
                } else if (iframe.contentWindow) {
                    iframe.contentWindow.document.body.innerHTML = "";
                } else if (iframe.document) {
                    iframe.document.body.innerHTML = "";
                }

                // Refresh DATA
                ALService.loadAll(
                    {reload: true, mode:$scope.mode},
                    // SUCCESS
                    function(data, handlers){
                        BusyService.busy(false);
                        $scope.reload();
                        $scope.files = [];
                        document.getElementById('alform').reset();
                    },
                    // ERROR
                    function(error){
                        $rootScope.handleError(error);
                    }
                );
            }

        }, 1000);
    };

    $scope.findAlIndexById = function(id){
        for(var i=0; i<$scope.menu.length; i++) {
            if (id == $scope.menu[i].id) return i;
        }
        return null;
    }

}

// UTIL FUNCTIONS
function getIdTree(data, path, tPath) {
    var result = null;
    if(angular.isDefined(data)) {
        var pathInfo = separateFirstToken(path, '.');
        var tPathInfo = separateFirstToken(tPath, '.');
        var obj = data[pathInfo[0]];
        if(angular.isArray(obj)) {
            result = [];
            for(var i=0; i<obj.length; i++) {
                if(angular.isDefined(obj[i].id)) {
                    var elem = {'id':obj[i].id};
                    if(pathInfo[1].length > 0) {
                        elem[tPathInfo[0]] = getIdTree(obj[i], pathInfo[1], tPathInfo[1]);
                    }
                    result.push(elem);
                }
            }
        } else if(angular.isObject(obj)) {
            result = {};
            if(angular.isDefined(obj.id)) {
                result.id = obj.id;
            }
            if(pathInfo[1].length > 0) {
                var sub = getIdTree(obj, pathInfo[1], tPathInfo[1]);
                result[tPathInfo[0]] = sub;
            }
        } else {
            throw new Error();
        }
    }
    return result;
}
function separateFirstToken(arrayStr, separator) {
    if(!angular.isString(arrayStr)) {
        throw new TypeError();
    }
    var array = arrayStr.split(separator);
    var token = array.splice(0, 1).toString();
    return [token, array.join(separator)];
}

function deb(elem) {
    console.log(elem);
}