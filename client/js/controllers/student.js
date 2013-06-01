function StudentCtrl($scope, $rootScope, $routeParams, $location, auth, als, database) {
    // TOP BAR
    $rootScope.top_bar = {
        page_title:'Activity Logs',
        main_menu_items:[
            { type:'item', label:'New Activity Log', icon:'icon-plus', func:$rootScope.logout },
            { type:'divider' },
            { type:'item', label:'Logout', icon:'icon-lock', func:$rootScope.logout },
            { type:'item', label:'Help', icon:'icon-question-sign', func:$rootScope.help },
            { type:'item', label:'Info', icon:'icon-info-sign', func:$rootScope.info }
        ]
    };
    $scope.setupTopBar = function () {
        if(!$rootScope.isMobile) {
            var baseTitle = "Activity Logs - ";
            $rootScope.top_bar.title_menu = [];

            for (var i = 0; i < $rootScope.modes.modes.length; i++) {
                var mode = $rootScope.modes.modes[i];
                var manuLabel = baseTitle + angular.uppercase(mode);

                if(mode == $rootScope.mode) {
                    $rootScope.top_bar.page_title = manuLabel;
                } else {
                    $rootScope.top_bar.title_menu.push({
                        label: manuLabel,
                        func: function() {
                            console.log(mode);
                            $rootScope.mode = mode;
                            $scope.setupTopBar();
                        }
                    });
                }
            }
        }
    };

    $scope.data = [];
    $scope.selected_al_id = $routeParams.id;
    $scope.selected_al = null;
    $scope.edit_selected = null;
    $scope.edit = false;

    auth.user(
        function (/*user*/) {

            als.modes(
                function(d, h) {    // SUCCESS

                    if(angular.isUndefined($rootScope.mode) || $rootScope.mode == null) {
                        $rootScope.mode = $rootScope.modes.default;
                    }
                    $scope.setupTopBar();


                    if (angular.isDefined($scope.selected_al_id) && $scope.selected_al_id != null) {
                        als.get(
                            $scope.selected_al_id,
                            function (datum, h) {    // SUCCESS
                                $scope.selected_al = database.select('als', [ {field:'id',value:$scope.selected_al_id} ], 2)[0];
                            }
                        );
                    }

                }
            );
return;


            als.all(
                false, // RELOAD
                'all', // MODE
                function (d, h) {                // SUCCESS

                    $scope.data = database.select('als',[],3);

                    if (angular.isDefined($scope.selected_al_id)
                        && $scope.selected_al_id != null) {
                        als.get(
                            $scope.selected_al_id,
                            function (datum, h) {    // SUCCESS
                                $scope.selected_al = database.select('als', [ {field:'id',value:$scope.selected_al_id} ], 2)[0];
                            }
                        );
                    } else {

                        $rootScope.top_bar.page_title = 'Activity Logs - ALL';
                        $rootScope.top_bar.title_menu = [
                            {
                                label: 'Activity Logs - MINE',
                                func: function() {}
                            },{
                                label: 'Activity Logs - NEWS',
                                func: function() {}
                            },{
                                label: 'Activity Logs - TEAM',
                                func: function() {}
                            },{
                                label: 'Activity Logs - PUBLIC',
                                func: function() {}
                            }
                        ];
                    }
                }
            );
        }
    );

    $scope.go = function (id) {
        var url = '/client/student';
        if (angular.isDefined(id)) {
            url += '/' + id;
        }
        $location.url(url);
    };

    $scope.reload = function () {
        als.all(
            true,
            'all',
            function (d, h) {    // SUCCESS
                $scope.data = database.select('als',[],3);
            }
        );
    };

    $scope.selected = function (id) {
        return $scope.selected_al_id == id ? 'active' : '';
    };

    $scope.editSelected = function () {
        $scope.edit = true;
        $scope.edit_selected = angular.copy($scope.selected_al);
    };

    $scope.unEditSelected = function () {
        $scope.edit = false;
        $scope.edit_selected = null;
    };

    $scope.download = function (id) {
        window.location.href = '/media/download/' + id + '?download=true';
    };

    $scope.save = function () {
        als.save(
            $scope.edit_selected,
            function(d, h) {    // SUCCESS
                $scope.data = database.select('als',[],3);
                $scope.selected_al = database.select('als', [ {field:'id',value:$scope.selected_al_id} ], 2)[0];
                $scope.unEditSelected();
            },
            function(e) {       // ERROR
            }
        );
    };

    // SHOW IMAGE
    $scope.openImage = function (id) {
        $scope.imageID = id;
        $scope.imageIsOpen = true;
    };
    $scope.closeImage = function () {
        $scope.imageID = null;
        $scope.imageIsOpen = false;
    };
    $scope.optsImage = {
        backdropFade: true,
        dialogFade:true
    };
}