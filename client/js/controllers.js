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
    $scope.new_project = null;
    $scope.selected_team = null;
    $scope.isSelectedTeam = function(id){
        return ( id == $scope.selected_team ? ACTIVE : NOT_ACTIVE );
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
        if(angular.isDefined(DBService.d.teams[id].id)) {
            $scope.selected_team = id;
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
                console.log('delete:');
                console.log(DBService.d.projects[id]);
            } else {
                DBService.m.projects[id].mode = 'deleting';
            }
        }console.log(DBService.d.projects[id]);
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