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

    $scope.data = [];
    $scope.selected_al_id = $routeParams.id;
    $scope.selected_al = null;
    $scope.edit_selected = null;
    $scope.edit = false;

    auth.user(
        function (user) {
            if (user == null) {
                $location.url('/client/login');
                return;
            }
            $rootScope.user = user;
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

                        $rootScope.top_bar.title_menu = [
                            {
                                label: 'Projects',
                                func: function() {
                                    $rootScope.toggleTitleMenu();
                                    $location.url('/client/projects');
                                }
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