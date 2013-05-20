/**
 mscproject module
 it defines the client side application.
 */
var app = angular.module('mscproject', [ 'ngResource', 'SSDB' ],function ($routeProvider, $locationProvider) {
    $routeProvider.when('/client/login', {
        templateUrl:'/client/partials/login.html',
        controller:"LoginCtrl"
    });
    $routeProvider.when('/client/student', {
        templateUrl:'/client/partials/student.html',
        controller:"StudentCtrl"
    });
    $routeProvider.when('/client/supervisor', {
        templateUrl:'/client/partials/supervisor.html',
        controller:"SupervisorCtrl"
    });
    $routeProvider.when('/client/users', {
        templateUrl:'/client/partials/users.html',
        controller:"UsersCtrl"
    });
    $routeProvider.when('/client/projects', {
        templateUrl:'/client/partials/projects.html',
        controller:"ProjectsCtrl"
    });
    $routeProvider.when('/client/project/:id', {
        templateUrl:'/client/partials/project.html',
        controller:"ProjectCtrl"
    });
    $routeProvider.otherwise({redirectTo:'/client/login'});

    // configure html5 to get links working
    // If you don't do this, you URLs will be base.com/#/home rather than base.com/home
    $locationProvider.html5Mode(true).hashPrefix('!');
}).run(function ($rootScope, $location, auth, BusyService, DBService, database) {

        // DB SCHEMA CREATION
        DBService.createTable("projects");
        DBService.createTable("teams");
        DBService.createTable("users");
        DBService.createTable("als");
        DBService.createTable("media");
        DBService.createTable("comments");

        database.createTable('Projects', 'id', {},
            { Teams:{table:'Teams', fkey:'project_id'} }
        );
        database.createTable('Teams', 'id',
            { Project:{table:'Projects', fkey:'project_id'} },  // BELONGS TO
            { Users:{table:'Users', fkey:'team_id'} }   // HAS MANY
        );
        database.createTable('Users', 'id',
            {
                Supervisor:{table:'Users', fkey:'supervisor_id'},
                Team:{table:'Teams', fkey:'team_id'}
            }, // BELONGS TO
            {students:{table:'Users', fkey:'supervisor_id'}}  // HAS MANY);
        );

        // TOPBAR TEMPLATE URL
        $rootScope.top_bar_url = '/client/partials/topbar.html';

        // MENUS
        $rootScope.mainmenu_open = "";
        $rootScope.toggleMenu = function () {
            if ($rootScope.mainmenu_open.length == 0) {
                $rootScope.mainmenu_open = "open";
            } else {
                $rootScope.mainmenu_open = "";
            }
        }
        $rootScope.titlemenu_open = "";
        $rootScope.toggleTitleMenu = function () {
            menu = angular.element('.title_menu');
            topbar = angular.element('.topbar');
            brand = angular.element('.brand');
            body = angular.element('body');

            menu.css('position', 'absolute');
            menu.css('top', (brand.position().top + brand.outerHeight()) + 'px');
            menu.css('left', (brand.position().left + 15) + 'px');

            if ($rootScope.titlemenu_open.length == 0) {
                $rootScope.titlemenu_open = "open";
            } else {
                $rootScope.titlemenu_open = "";
            }
        }

        // GENERAL FUNCTIONS
        $rootScope.info = function () {
            $rootScope.toggleMenu();
        }

        $rootScope.help = function () {
            $rootScope.toggleMenu();
        }

        $rootScope.logout = function () {
            $rootScope.toggleMenu();
            BusyService.busy(true);

            $rootScope.user = auth.logout();
            $rootScope.user.$then(
                function () {
                    console.log($rootScope.user);
                    BusyService.busy(false);
                    $location.url('/client/login');
                },
                function () {
                    BusyService.busy(false);
                    $location.url('/client/login');
                }
            )
        }

        $rootScope.handleError = function (err_data) {
            if (err_data.status == 401) {
                $location.url('/client/login');
            }
        }

        // THUMBS HELPER
        $rootScope.getThumbUrl = function (media) {
            if (angular.isDefined(media) && media['has_thumb']) {
                return "/media/download/" + media['id'] + "?thumb=BIG";
            } else {
                switch (media['content-type']) {
                    case "image/png":
                        return "/client/img/default_thumbs/png.png";
                        break;
                    case "image/jpeg":
                        return "/client/img/default_thumbs/jpeg.png";
                        break;
                    case "image/gif":
                        return "/client/img/default_thumbs/gif.png";
                        break;
                    case "application/json":
                        return "/client/img/default_thumbs/json.png";
                        break;
                    case "application/zip":
                        return "/client/img/default_thumbs/zip.png";
                        break;
                    case "application/pdf":
                        return "/client/img/default_thumbs/pdf.png";
                        break;
                    case "text/xml":
                        return "/client/img/default_thumbs/xml.png";
                        break;
                    case "text/html":
                        return "/client/img/default_thumbs/html.png";
                        break;
                    case "application/msword":
                        return "/client/img/default_thumbs/doc.png";
                        break;
                    case "application/vnd.openxmlformats-officedocument":
                        return "/client/img/default_thumbs/office.png";
                        break;
                    default:
                        return "/client/img/default_thumbs/file.png";
                        break;
                }
            }
        }

        $rootScope.windowWidth = $(window).width();
        $rootScope.isMobile = $rootScope.windowWidth < 767;
        $(window).resize(function () {
            $rootScope.$apply(function () {
                $rootScope.windowWidth = $(window).width();
                $rootScope.isMobile = ($rootScope.windowWidth < 767);
            });
        });

    })
    .filter('dbFilter', function (DBService) {
        return function (value, param, table, key) {
            if (!angular.isString(param) || !param.trim().length > 0) {
                return value;
            }
            param = angular.lowercase(param);
            var result = [];
            for (var i = 0; i < value.length; i++) {
                var val = angular.lowercase(DBService.d[table][value[i].id][key]);
                if (val.indexOf(param) >= 0) {
                    result.push(value[i])
                }
            }
            return result;
        };
    })
    .service('BusyService', function ($rootScope) {
        // PUT SERVICE IN ROOTE SCOPE
        $rootScope.BUSY = this;

        var BUSY_CLASS_BUSY = "busy";
        var BUSY_CLASS_NOT_BUSY = "";

        this.busy_monitor = 0;
        this.busy_class = BUSY_CLASS_NOT_BUSY;

        this.busy = function (busy) {
            if (busy == true) {
                this.busy_monitor++;
                this.busy_class = this.busyClass();
            } else if (busy == false) {
                this.busy_monitor = Math.max(0, this.busy_monitor - 1);
                this.busy_class = this.busyClass();
            }
            return this.busy_monitor > 0;
        };

        this.busyClass = function () {
            if (this.busy_monitor > 0) {
                return BUSY_CLASS_BUSY;
            } else {
                return BUSY_CLASS_NOT_BUSY;
            }
        }
    })
    .service('DBService', function ($rootScope) {
        $rootScope.DB = this;

        this.t_names = [];

        this.d = {};
        this.m = {};

        this.createTable = function (table_name) {
            if (this.t_names.indexOf(table_name) < 0) {
                this.d[table_name] = {};
                this.m[table_name] = {};

                this.t_names.push(table_name);
            } else {
                throw "Table name already in use.";
            }
        }
        this.insertData = function (table_name, id, data) {
            if (this.t_names.indexOf(table_name) >= 0) {
                var old = this.d[table_name][id];
                this.d[table_name][id] = data;
                return old;
            } else {
                throw "Unknown table " + table_name + ".";
            }
        }
        this.insertMeta = function (table_name, id, key, value) {
            if (this.t_names.indexOf(table_name) >= 0) {
                if (angular.isUndefined(this.m[table_name][id])) {
                    this.m[table_name][id] = {};
                }
                var old = this.m[table_name][id][key];
                this.m[table_name][id][key] = value;
                return old;
            } else {
                throw "Unknown table " + table_name + ".";
            }
        }

    })
    .service('ProjectsService', function($resource, BusyService, database){
        var _THIS = this;

        this.DATA_KEY = 'Project';
        this.TABLE = 'Projects';
        this.PKEY = 'id';

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

        this.loadAll = function (reload, success, error) {
            // PARAM MANAGEMENT
            if (arguments.length > 0 && typeof arguments[0] == "function") {
                if (arguments.length > 1) {
                    error = arguments[1];
                }
                success = arguments[0];
                reload = false;
            }

            BusyService.busy(true);
            var result = this.Projects.all(
                function (d, h) {
                    BusyService.busy(false);

                    _THIS.insertProjects(d);

                    // CALLBACKS
                    if (angular.isDefined(success)) {
                        success(d, h);
                    }
                },
                function (e) {
                    BusyService.busy(false);

                    // CALLBACKS
                    if (angular.isDefined(error)) {
                        error(e);
                    }
                }
            );
        }
        this.load = function (id, success, error) {
            if (!angular.isDefined(id)) {
                throw "Missing project ID";
            }

            var existing = database.get(this.TABLE, id, 0);
            if (existing.status == STATUS_PARTIAL) {
                BusyService.busy(true);
                var proj = this.Projects.load(
                    {
                        id : id
                    },
                    function (d, h) {
                        BusyService.busy(false);

                        // ADD METADATA
                        _THIS.insertProject(proj);
                        console.log(d);

                        // CALLBACKS
                        if (angular.isDefined(success)) {
                            success(d, h);
                        }
                    },
                    function (e) {
                        BusyService.busy(false);

                        // CALLBACKS
                        if (angular.isDefined(error)) {
                            error(e);
                        }
                    }
                );
            } else {
                // CALLBACK
                if (angular.isDefined(success)) {
                    success(true);
                }
            }
        }
        this.insertProjects = function (data) {
            if (angular.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    if (angular.isDefined(data[i][this.DATA_KEY])) {
                        this.insertProject(data[i][this.DATA_KEY]);
                    }
                }
            }
        };
        this.insertProject = function(data) {
            if(angular.isDefined(data)) {
                data[STATUS_KEY] = STATUS_PARTIAL;
                database.insert(this.TABLE, data[this.PKEY], data);
            }
        }
    })
    .service('TeamsService', function(ProjectsService, database){
        this.DATA_KEY = 'Team';
        this.TABLE = 'Teams';
        this.PKEY = 'id';

        this.insertTeam = function(data) {
            if(angular.isDefined(data)) {
                var project = data[ProjectsService.DATA_KEY];
                if(angular.isDefined(project) && project!=null) {
                    ProjectsService.insertProject(project);
                }
                delete data[ProjectsService.DATA_KEY];
                database.insert(this.TABLE, data[this.PKEY], data);
            }
        }
    })
    .service('UsersService', function ($rootScope, $resource, BusyService, DBService, TeamsService, database) {

        var _THIS = this;

        // DB ACCESS
        this.TABLE = 'Users';
        this.DATA_KEY = 'User';
        this.PKEY = 'id';
        this.SUPERVISOR_KEY = 'Supervisor';
        this.SUPERVISOR_FKEY = 'supervisor_id';
        this.TEAM_FKEY = 'team_id';

        this.Users = $resource('/users/:id', { id:'@id' }, {
            all:{
                method:'GET',
                isArray:true
            },
            load:{
                method:'GET',
                isArray:false
            }
        });

        this.loadAll = function (reload, success, error) {
            // PARAM MANAGEMENT
            if (arguments.length > 0 && typeof arguments[0] == "function") {
                if (arguments.length > 1) {
                    error = arguments[1];
                }
                success = arguments[0];
                reload = false;
            }

            BusyService.busy(true);
            var result = this.Users.all(
                function (d, h) {
                    BusyService.busy(false);

                    _THIS.insertUsers(d);

                    // CALLBACKS
                    if (angular.isDefined(success)) {
                        success(d, h);
                    }
                },
                function (e) {
                    BusyService.busy(false);

                    // CALLBACKS
                    if (angular.isDefined(error)) {
                        error(e);
                    }
                }
            );
        }
        this.save = function(user, success, error){
            var user_id = user[this.PKEY];
            if (!angular.isDefined(user_id) || user_id == null) {
                throw "Missing user ID";
            }

            var existing = database.get(this.TABLE, user_id, 0);
            var params = {};
                params[this.PKEY] = user_id;

            delete user.created;
            delete user.modified;

            BusyService.busy(true);
            this.Users.save(
                params,
                { 'User' : user },
                function(d, h) {
                    BusyService.busy(false);

                    // CALLBACKS
                    if (angular.isDefined(success)) {
                        success(d, h);
                    }
                },
                function(e) {
                    BusyService.busy(false);

                    // CALLBACKS
                    if (angular.isDefined(error)) {
                        error(e);
                    }
                }
            );

        };

        // DATABASE RELATED
        this.insertUsers = function (data) {
            if (angular.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    if (angular.isDefined(data[i][this.DATA_KEY])) {
                        this.insertUser(data[i][this.DATA_KEY]);
                    }
                }
            }
        }
        this.insertUser = function (data) {
            if (angular.isDefined(data)) {
                var supervisor = angular.copy(data[this.SUPERVISOR_KEY]);
                if (supervisor != null) {
                    var supervisor_id = supervisor[this.PKEY];
                    data[this.SUPERVISOR_FKEY] = supervisor_id;

                    var existing = database.get(this.TABLE, supervisor_id, 0);
                    if (angular.isUndefined(existing)) {
                        this.insertUser(supervisor);
                    }
                }
                delete data[this.SUPERVISOR_KEY];

                var teams = data[TeamsService.DATA_KEY];
                if (angular.isDefined(teams) && teams.length > 0) {
                    var team_id = teams[0][TeamsService.PKEY];
                    data[this.TEAM_FKEY] = team_id;

                    var existing = database.get(TeamsService.TABLE, team_id, 0);
                    if (angular.isUndefined(existing)) {
                        TeamsService.insertTeam(teams[0]);
                    }
                }
                delete data[TeamsService.DATA_KEY];

                // META
                data[MODE_KEY] = MODE_NORMAL;
                data[STATUS_KEY] = STATUS_PARTIAL;

                database.insert(this.TABLE, data[this.PKEY], data);
            }
        }
    })
//    .service('ProjectsService', function ($rootScope, $resource, BusyService, DBService) {
//        $rootScope.PS = this;
//        var _THIS = this;
//
//        // MODE CONSTANTS
//        var MODE_KEY = 'mode';
//        var MODE_EDIT = 'edit'
//        var MODE_NORMAL = 'normal'
//        var MODE_DELETING = 'deleting';
//        // STATUS CONSTANTS
//        var STATUS_KEY = 'status';
//        var STATUS_PARTIAL = 'partial';
//        var STATUS_COMPLETE = 'complete';
//        var STATUS_NEW = 'new';
//
//        this.Projects = $resource('/projects/:id', { id:'@id' }, {
//            all:{
//                method:'GET',
//                isArray:true
//            },
//            load:{
//                method:'GET',
//                isArray:false
//            }
//        });
//        this.Teams = $resource('/teams/:id', { id:'@id' }, {
//            save:{
//                method:'POST'
//            },
//            addMember:{
//                url:'/teams/addMember/:tid/:uid',
//                method:'POST'
//            },
//            removeMember:{
//                url:'/teams/removeMember/:tid/:uid',
//                method:'DELETE'
//            }
//        });
//
//        this.loadAll = function (reload, success, error) {
//            // PARAM MANAGEMENT
//            if (arguments.length > 0 && typeof arguments[0] == "function") {
//                if (arguments.length > 1) {
//                    error = arguments[1];
//                }
//                success = arguments[0];
//                reload = false;
//            }
//
//            BusyService.busy(true);
//            var result = this.Projects.all(
//                function (d, h) {
//                    BusyService.busy(false);
//                    _THIS.insertProjects(d);
//
//                    // CALLBACKS
//                    if (angular.isDefined(success)) {
//                        success(d, h);
//                    }
//                },
//                function (e) {
//                    BusyService.busy(false);
//
//                    // CALLBACKS
//                    if (angular.isDefined(error)) {
//                        error(e);
//                    }
//                }
//            );
//        }
//
//        this.load = function (id, success, error) {
//            if (!angular.isDefined(id)) {
//                throw "Missing project ID";
//            }
//
//            if (DBService.m.projects[id].status == STATUS_PARTIAL) {
//                BusyService.busy(true);
//                var proj = this.Projects.load(
//                    {
//                        id:id
//                    },
//                    function (d, h) {
//                        BusyService.busy(false);
//
//                        // ADD METADATA
//                        _THIS.insertProject(proj);
//
//                        // CALLBACKS
//                        if (angular.isDefined(success)) {
//                            success(d, h);
//                        }
//                    },
//                    function (e) {
//                        BusyService.busy(false);
//
//                        // CALLBACKS
//                        if (angular.isDefined(error)) {
//                            error(e);
//                        }
//                    }
//                );
//            } else {
//                // CALLBACK
//                if (angular.isDefined(success)) {
//                    success(true);
//                }
//            }
//        }
//
//        this.save = function (id, success, error) {
//            if (!angular.isDefined(id)) {
//                throw "Missing project ID";
//            }
//
//            var data = id;
//            var params = {};
//            if (angular.isDefined(DBService.d.projects[id])) {
//                data = DBService.d.projects[id];
//                params = {'id':id};
//            }
//
//            delete data.created;
//            delete data.modified;
//
//            BusyService.busy(true);
//            var proj = this.Projects.save(
//                params,
//                data,
//                function (d, h) {
//                    BusyService.busy(false);
//                    _THIS.insertProject(proj);
//
//                    // CALLBACKS
//                    if (angular.isDefined(success)) {
//                        success(d, h);
//                    }
//                },
//                function (data) {
//                    BusyService.busy(false);
//
//                    // CALLBACKS
//                    if (angular.isDefined(error)) {
//                        error(e);
//                    }
//                }
//            );
//        }
//
//        this.delete = function (id, success, error) {
//            if (!angular.isDefined(id)) {
//                throw "Missing project ID";
//            }
//
//            BusyService.busy(true);
//            var proj = this.Projects.delete(
//                {'id':id},
//                {},
//                function (d, h) {
//                    BusyService.busy(false);
//                    _THIS.deleteProject(id);
//
//                    // CALLBACKS
//                    if (angular.isDefined(success)) {
//                        success(d, h);
//                    }
//                },
//                function (data) {
//                    BusyService.busy(false);
//
//                    // CALLBACKS
//                    if (angular.isDefined(error)) {
//                        error(e);
//                    }
//                }
//            );
//        }
//
//        this.saveTeam = function (data, success, error) {
//            if (!angular.isDefined(data)) {
//                throw "Missing team DATA";
//            }
//
//            delete data.created;
//            delete data.modified;
//
//            this.Teams.save(
//                {},
//                data,
//                function (d, h) {
//                    BusyService.busy(false);
//
//                    // CALLBACKS
//                    if (angular.isDefined(success)) {
//                        success(d, h);
//                    }
//                },
//                function (data) {
//                    BusyService.busy(false);
//
//                    // CALLBACKS
//                    if (angular.isDefined(error)) {
//                        error(e);
//                    }
//                }
//            );
//        }
//
//        this.deleteTeam = function (id, success, error) {
//            if (!angular.isDefined(id)) {
//                throw "Missing team ID";
//            }
//
//            this.Teams.delete(
//                {"id":id},
//                {},
//                function (d, h) {
//                    BusyService.busy(false);
//                    _THIS.removeTeam(id);
//
//                    // CALLBACKS
//                    if (angular.isDefined(success)) {
//                        success(d, h);
//                    }
//                },
//                function (data) {
//                    BusyService.busy(false);
//
//                    // CALLBACKS
//                    if (angular.isDefined(error)) {
//                        error(e);
//                    }
//                }
//            );
//        }
//
//        this.addMember = function (t_id, u_id, success, error) {
//            if (!angular.isDefined(t_id)) {
//                throw "Missing team ID";
//            }
//            if (!angular.isDefined(u_id)) {
//                throw "Missing user ID";
//            }
//
//            this.Teams.addMember(
//                { "tid":t_id, "uid":u_id },
//                {},
//                function (d, h) {
//                    BusyService.busy(false);
//                    _THIS.insertTeam(d['Team']);
//
//                    // CALLBACKS
//                    if (angular.isDefined(success)) {
//                        success(d, h);
//                    }
//                },
//                function (data) {
//                    BusyService.busy(false);
//
//                    // CALLBACKS
//                    if (angular.isDefined(error)) {
//                        error(e);
//                    }
//                }
//            )
//
//        }
//
//        this.removeMember = function (t_id, u_id, success, error) {
//            if (!angular.isDefined(t_id)) {
//                throw "Missing team ID";
//            }
//            if (!angular.isDefined(u_id)) {
//                throw "Missing user ID";
//            }
//
//            this.Teams.removeMember(
//                { "tid":t_id, "uid":u_id },
//                {},
//                function (d, h) {
//                    BusyService.busy(false);
//                    _THIS.removeTeam(d['Team']);
//
//                    // CALLBACKS
//                    if (angular.isDefined(success)) {
//                        success(d, h);
//                    }
//                },
//                function (data) {
//                    BusyService.busy(false);
//
//                    // CALLBACKS
//                    if (angular.isDefined(error)) {
//                        error(e);
//                    }
//                }
//            )
//
//        }
//
//        // DB ACCESS FUNCS
//        this.insertProjects = function (data) {
//            if (angular.isArray(data)) {
//                for (var i = 0; i < data.length; i++) {
//                    this.insertProject(data[i]);
//                }
//            }
//        }
//        this.insertProject = function (data) {
//            if (angular.isDefined(data) &&
//                angular.isDefined(data['Project']) &&
//                angular.isDefined(data['Project']['id'])) {
//
//                if (angular.isDefined(data['Project']['Team'])) {
//                    this.insertTeams(data['Project']['Team']);
//                    DBService.insertMeta("projects", data['Project']['id'], STATUS_KEY, STATUS_COMPLETE);
//                } else {
//                    DBService.insertMeta("projects", data['Project']['id'], STATUS_KEY, STATUS_PARTIAL);
//                }
//                DBService.insertMeta("projects", data['Project']['id'], MODE_KEY, MODE_NORMAL);
//                var proj = angular.copy(data['Project']);
//                delete proj['Team'];
//                DBService.insertData("projects", data['Project']['id'], proj);
//
//            }
//        }
//
//        this.deleteProject = function (id) {
//            if (angular.isDefined(id) && angular.isDefined(DBService.d.projects[id])) {
//                delete DBService.d.projects[id];
//                delete DBService.m.projects[id];
//            }
//        }
//
//        this.removeTeam = function (id) {
//            if (angular.isDefined(id) && angular.isDefined(DBService.d.teams[id])) {
//                delete DBService.d.teams[id];
//                delete DBService.m.teams[id];
//            }
//        }
//
//        this.insertTeams = function (data) {
//            if (angular.isArray(data)) {
//                for (var i = 0; i < data.length; i++) {
//                    this.insertTeam(data[i]);
//                }
//            }
//        }
//
//        this.insertTeam = function (data) {
//            if (angular.isDefined(data)) {
//                this.insertUsers(data['Student']);
//
//                var team = angular.copy(data);
//                delete team['Student'];
//                DBService.insertData("teams", data['id'], team);
//                DBService.insertMeta("teams", data['id'], STATUS_KEY, STATUS_COMPLETE);
//                DBService.insertMeta("teams", data['id'], MODE_KEY, MODE_NORMAL);
//
//            }
//        }
//
//        this.insertUsers = function (data) {
//            if (angular.isArray(data)) {
//                for (var i = 0; i < data.length; i++) {
//                    this.insertUser(data[i]);
//                }
//            }
//        }
//
//        this.insertUser = function (data) {
//            if (angular.isDefined(data)) {
//
//                var user = angular.copy(data);
//                DBService.insertData("users", data['id'], user);
//                DBService.insertMeta("users", data['id'], STATUS_KEY, STATUS_PARTIAL);
//                DBService.insertMeta("users", data['id'], MODE_KEY, MODE_NORMAL);
//            }
//        }
//
//    })
    .service('ALService', function ($rootScope, $resource, BusyService, DBService) {
        $rootScope.PS = this;
        var _THIS = this;


        this.ALs = $resource('/activity_logs/:id', { id:'@id' }, {
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

        this.loadAll = function (config, success, error) {
            // PARAM MANAGEMENT
            if (arguments.length > 0 && typeof arguments[0] == "function") {
                if (arguments.length > 1) {
                    error = arguments[1];
                }
                success = arguments[0];
                config = {
                    reload:false,
                    mode:""
                };
            }

            BusyService.busy(true);
            var als = this.ALs.all(
                { "mode":config.mode },
                function (d, h) {
                    BusyService.busy(false);
                    _THIS.insertALs(d);

                    // CALLBACKS
                    if (angular.isDefined(success)) {
                        success(d, h);
                    }
                },
                function (e) {
                    BusyService.busy(false);

                    // CALLBACKS
                    if (angular.isDefined(error)) {
                        error(e);
                    }
                }
            );

        }

        this.modes = function (success, error) {
            BusyService.busy(true);
            this.ALs.modes(
                function (d, h) {
                    BusyService.busy(false);

                    // CALLBACKS
                    if (angular.isDefined(success)) {
                        success(d, h);
                    }
                },
                function (e) {
                    // CALLBACK
                    if (angular.isDefined(success)) {
                        success(DBService.d.als[id]);
                    }
                }
            );
        }

        this.load = function (id, success, error) {
            if (!angular.isDefined(id)) {
                throw "Missing active log ID";
            }
            if (angular.isDefined(DBService.d.als[id]) && DBService.m.als[id].status == 'partial') {
                BusyService.busy(true);
                var als = this.ALs.load(
                    { "id":id },
                    function (d, h) {
                        BusyService.busy(false);
                        _THIS.insertAL(d['ActivityLog'], 'complete');

                        // CALLBACKS
                        if (angular.isDefined(success)) {
                            success(d, h);
                        }
                    },
                    function (e) {
                        BusyService.busy(false);

                        // CALLBACKS
                        if (angular.isDefined(error)) {
                            error(e);
                        }
                    }
                );
            } else {
                // CALLBACK
                if (angular.isDefined(success)) {
                    success(DBService.d.als[id]);
                }
            }

        }

        this.save = function (id, success, error) {
            if (!angular.isDefined(id)) {
                throw "Missing activity log ID";
            }

            if (angular.isDefined(DBService.d.als[id])) {
                var data = DBService.d.als[id];
                var params = { 'id':id };

                delete data.modified;
                delete data.created;

                BusyService.busy(true);
                var al = this.ALs.save(
                    params,
                    data,
                    function (d, h) {
                        BusyService.busy(false);
                        _THIS.insertAL(al['ActivityLog']);

                        // CALLBACKS
                        if (angular.isDefined(success)) {
                            success(d, h);
                        }
                    },
                    function (data) {
                        BusyService.busy(false);

                        // CALLBACKS
                        if (angular.isDefined(error)) {
                            error(e);
                        }
                    }
                );
            }

        }


        this.delete = function (id, success, error) {
            if (!angular.isDefined(id)) {
                throw "Missing activity log ID";
            }

            BusyService.busy(true);
            var al = this.ALs.delete(
                {'id':id},
                {},
                function (d, h) {
                    BusyService.busy(false);
                    _THIS.deleteAl(id);

                    // CALLBACKS
                    if (angular.isDefined(success)) {
                        success(d, h);
                    }
                },
                function (data) {
                    BusyService.busy(false);

                    // CALLBACKS
                    if (angular.isDefined(error)) {
                        error(e);
                    }
                }
            );
        }

        this.insertALs = function (d) {
            if (angular.isArray(d)) {
                for (var i = 0; i < d.length; i++) {
                    this.insertAL(d[i]['ActivityLog']);
                }
            }
        }

        this.insertAL = function (d, status) {
            if (angular.isDefined(d)) {
                var al = angular.copy(d);

                var comments;
                if (angular.isDefined(al['Comment'])) {
                    _THIS.insertComments(al['Comment']);
                    comments = _THIS.getIds(al['Comment']);
                }
                var media;
                if (angular.isDefined(al['Media'])) {
                    _THIS.insertMedia(al['Media']);
                    media = _THIS.getIds(al['Media']);
                }
                if (angular.isDefined(al['User'])) {
                    _THIS.insertUser(al['User']);
                }
                if (angular.isUndefined(status)) {
                    status = 'partial';
                }

                delete al.Comment;
                delete al.Media;
                delete al.User;

//            console.log(al);
//            console.log(al['id']);
//            console.log(DBService.d.als[al['id']]);

                DBService.insertData('als', al['id'], al);

                DBService.insertMeta('als', al['id'], 'media', media);
                DBService.insertMeta('als', al['id'], 'comments', comments);
                DBService.insertMeta('als', al['id'], 'user', [ al['user_id'] ]);

                DBService.insertMeta('als', al['id'], 'status', status);
                if (status == 'partial') {
                    DBService.insertMeta('als', al['id'], 'show_info', false);
                    DBService.insertMeta('als', al['id'], 'show_media', false);
                    DBService.insertMeta('als', al['id'], 'show_comments', false);
                }

            }
        }

        this.deleteAl = function (id) {
            if (angular.isDefined(id) && angular.isDefined(DBService.d.als[id])) {
                delete DBService.d.als[id];
                delete DBService.m.als[id];
            }
        }

        this.insertComments = function (d) {
            if (angular.isArray(d)) {
                for (var i = 0; i < d.length; i++) {
                    this.insertComment(d[i]);
                }
            }
        }

        this.insertComment = function (d) {
            var com = angular.copy(d);

            var status = 'partial';
            var media;
            if (angular.isDefined(com['Media'])) {
                var status = 'complete';
                _THIS.insertMedia(com['Media']);
                media = _THIS.getIds(com['Media']);
                delete com['Media'];
            }
            var user;
            if (angular.isDefined(com['User'])) {
                var status = 'complete';
                _THIS.insertUser(com['User']);
                user = [ com['User'].id ];
                delete com['User'];
            }

            DBService.insertData('comments', d['id'], com);
            DBService.insertMeta('comments', d['id'], 'media', media);
            DBService.insertMeta('comments', d['id'], 'user', user);
            DBService.insertMeta('comments', d['id'], 'status', status);
        }

        this.insertMedia = function (d) {
            if (angular.isArray(d)) {
                for (var i = 0; i < d.length; i++) {
                    this.insertMedium(d[i]);
                }
            }
        }

        this.insertMedium = function (d) {
            DBService.insertData('media', d['id'], angular.copy(d));
            DBService.insertMeta('media', d['id'], 'status', 'partial');
        }

        this.insertUser = function (d) {
            DBService.insertData('users', d['id'], angular.copy(d));
            DBService.insertMeta('users', d['id'], 'status', 'partial');
        }

        this.getIds = function (a) {
            var res = [];
            if (angular.isArray(a)) {
                for (var i = 0; i < a.length; i++) {
                    if (angular.isDefined(a[i].id)) {
                        res.push(a[i].id);
                    }
                }
            }
            return res;
        }

    })
    .service('auth', function (Users) {

        this.auth = function (username, password) {
            var xsrf = $.param({
                "data[User][username]":username,
                "data[User][password]":password
            });
            return Users.login(xsrf);

        }

        this.logout = function () {
            return Users.logout();
        }

        this.user = function () {
            return Users.user();
        }

    })
    .factory('Users', function ($resource) {
        return $resource('/users/:id', {}, {
            all:{
                method:'GET',
                isArray:true
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
    })
    .factory('Projects', function ($resource) {
        return $resource('/projects/:id', { id:'@id' }, {
            all:{
                method:'GET',
                isArray:true
            },
            get:{
                method:'GET'
            }
        });
    });

function OLDAlCtrl($scope, $rootScope, $location, $routeParams, $resource, auth, DialogService, WindDims) {

    if ($rootScope.alMode == null) {
        var MODES = $resource('/activity_logs/modes');
        $rootScope.alModes = MODES.get({}, function () {
            $rootScope.alMode = $rootScope.alModes['default'];
        });
    }

    auth.auth(function (result) {
        if (!result) {
            $location.url($scope.LOGIN_URI);
        }
    });

    $scope.mainmenu_open = "";
    $scope.toggleMenu = function () {
        if ($scope.mainmenu_open.length == 0) {
            $scope.mainmenu_open = "open";
        } else {
            $scope.mainmenu_open = "";
        }
    }
    $scope.titlemenu_open = "";
    $scope.toggleTitleMenu = function () {
        if ($scope.titlemenu_open.length == 0) {
            $scope.titlemenu_open = "open";
        } else {
            $scope.titlemenu_open = "";
        }
    }

    var ALs = $resource('/activity_logs/:id?mode=:mode');
    var Media = $resource('media/:id');
    $scope.al = null;
    $scope.files = [];

    $scope.addFile = function () {
        $scope.files.push({});
    }
    $scope.removeFile = function (index) {
        if (index < $scope.files.length) {
            $scope.files.splice(index, 1);
        }
    }

    if (!$routeParams['id']) {

        $scope.predicate = '-ActivityLog.modified';
        $scope.activityLogs = ALs.query({mode:$rootScope.alMode}, function () {
        });

        // I-FRAME LISTENER SETUP
        // Used to handle the new Activity Logs
        var iframe = document.getElementById('iframeNewAl');
        iframe.addEventListener("load", function () {

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
                $scope.confirm_message = result;
                DialogService.createDialog("alert", $scope, "/client/partials/dialogs/confirm.html", {
                    autoOpen:true,
                    width:"50%",
                    modal:false,
                    buttons:[
                        { text:"OK", click:function () {
                            DialogService.destroyDialog("alert");
                        } }
                    ],
                    close:function () {
                        DialogService.destroyDialog("alert")
                    }
                });
            }

            // Refresh DATA
            $scope.activityLogs = ALs.query({mode:$rootScope.alMode}, function () {
            });

        }, true);

        $scope.newAl = function () {
            var w = "50%";
            if (WindDims.getWinDims()['w'] < 769) {
                w = "95%";
            }
            DialogService.createDialog("newAl", $scope, "/client/partials/dialogs/newAl.html", {
                modal:true,
                width:w,
//                position: { my: "top", at: "top", of: window },
                buttons:[
                    { text:"OK", click:function () {
                        $scope.submitALForm();
                    } },
                    { text:"Cancel", click:function () {
                        $scope.hideNewAl();
                    } }
                ],
                beforeClose:function () {
                    $scope.$apply(function () {
                        document.forms[0].reset();
                        $scope.files = [];
                        DialogService.destroyDialog("newAl");
                    });
                    return false;
                }
            });
            DialogService.openDialog("newAl");
        }
        $scope.hideNewAl = function () {
            document.forms[0].reset();
            DialogService.closeDialog("newAl");
        }

        $scope.submitALForm = function () {
            document.forms[0].submit();
            $scope.hideNewAl();
        }


        $scope.showAl = function (elem) {
            $location.url('/client/al/' + elem.item.ActivityLog.id);
        }

        $scope.edit = function (elem) {
            console.log(elem);
        }

        $scope.delete = function (elem) {
            DialogService.createDialog("confirm", $scope, "/client/partials/dialogs/confirm.html", {
                autoOpen:false,
                width:"50%",
                modal:true,
                buttons:[
                    { text:"Yes", click:function () {
                        DialogService.destroyDialog("confirm");
                        var ret = ALs.delete({id:elem.item.ActivityLog.id}, function () {
                                var ALs2 = $resource('/activity_logs/:id');
                                $scope.activityLogs = ALs2.query(function () {
                                });
                                console.log($scope.activityLogs);
                            }, function () {
                                $scope.confirm_message = "An error has occurred";
                                DialogService.createDialog("alert", $scope, "/client/partials/dialogs/confirm.html", {
                                    autoOpen:true,
                                    width:"50%",
                                    modal:false,
                                    buttons:[
                                        { text:"OK", click:function () {
                                            DialogService.destroyDialog("alert");
                                        } }
                                    ],
                                    close:function () {
                                        DialogService.destroyDialog("alert")
                                    }
                                });
                            }
                        );
                    } },
                    {text:"No", click:function () {
                        DialogService.destroyDialog("confirm");
                    } }
                ]
            });
            $scope.confirm_message = "Are you sure to delete \"" + elem.item['ActivityLog']['title'] + "\" activity log?";
            DialogService.openDialog("confirm");
        }

        $scope.reload = function () {
            $scope.activityLogs = ALs.query({mode:$rootScope.alMode}, function () {
            });
        }

        $scope.updateMode = function () {
            // Necessary because the select/option doesn't update $rootScope.alMode
            $rootScope.alMode = $scope.alMode;
            $scope.reload();
        }

    } else {

        $scope.show_media = false;
        $scope.showMedia = function (media) {
            if (media['Media']['content-type'].indexOf("image/") == 0) {
                $scope.show_media = true;
                console.log("/media/download/" + media['Media']['Media']['id']);
                $scope.media_url = "/media/download/" + media['Media']['Media']['id'];
            } else {
                window.location.href = "/media/download/" + media['Media']['Media']['id'] + "?download=true";
            }
        }
        $scope.hideMedia = function () {
            $scope.show_media = false;
            $scope.media_url = "";
        }

        $scope.back = function () {
            $location.url('/client/al/');
        }
        $scope.al = ALs.get({id:$routeParams['id']}, function () {
            console.log($scope.al);
        });

        $scope.reload = function () {
            $scope.al = ALs.get({id:$routeParams['id']}, function () {
                console.log($scope.al);
            });
        }

        $scope.newCom = function () {
            var w = "50%";
            if (WindDims.getWinDims()['w'] < 769) {
                w = "95%";
            }
            DialogService.createDialog("newCom", $scope, "/client/partials/dialogs/newCom.html", {
                modal:true,
                width:w,
//                position: { my: "top", at: "top", of: window },
                buttons:[
                    { text:"OK", click:function () {
                        $scope.submitComForm();
                    } },
                    { text:"Cancel", click:function () {
                        $scope.hideNewCom();
                    } }
                ],
                beforeClose:function () {
                    $scope.$apply(function () {
                        document.forms[0].reset();
                        $scope.files = [];
                        DialogService.destroyDialog("newCom");
                    });
                    return false;
                }
            });
            DialogService.openDialog("newCom");
        }

        $scope.submitComForm = function () {
            document.forms[0].submit();
        }
    }

    $scope.logout = function () {
        auth.logout(function (result) {
            console.log(result);
            if (result) {
                $location.url($scope.LOGIN_URI);
            }
        });
    }

}
function OLDLoginCtrl($scope, $location, $http, auth) {

    $scope.mainmenu_open = "";
    $scope.toggleMenu = function () {
        if ($scope.mainmenu_open.length == 0) {
            $scope.mainmenu_open = "open";
        } else {
            $scope.mainmenu_open = "";
        }
    }
    $scope.titlemenu_open = "";
    $scope.toggleTitleMenu = function () {
        if ($scope.titlemenu_open.length == 0) {
            $scope.titlemenu_open = "open";
        } else {
            $scope.titlemenu_open = "";
        }
    }

    $scope.username = "s.susini";
    $scope.password = "30071980";

    $scope.show_logout = false;

    auth.auth(function (result) {
        if (result) {
            console.log(result);
            $location.url($scope.REDIRECT_AFTER_LOGIN);
        }
    });

    $scope.login = function () {

        auth.credentials($scope.username, $scope.password);
        auth.auth(function (result) {
            console.log(result);
            $scope.show_logout = true;
            if (result) {
                $location.url($scope.REDIRECT_AFTER_LOGIN);
                $scope.show_logout = true;
            } else {
                // TODO: message user wrong login!
            }
        });

    };

    $scope.logout = function () {
        auth.logout(function (result) {
            console.log(result);
            $scope.show_logout = false;
        });
    }

}

// MODE CONSTANTS
var MODE_KEY = 'mode';
var MODE_EDIT = 'edit'
var MODE_NORMAL = 'normal'
var MODE_DELETING = 'deleting';
// STATUS CONSTANTS
var STATUS_KEY = 'status';
var STATUS_PARTIAL = 'partial';
var STATUS_COMPLETE = 'complete';
var STATUS_NEW = 'new';

function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}