function SupervisorCtrl($scope, $rootScope, $routeParams, $location, auth, als, users, database) {
    // TOP BAR
    $scope.setupTopBar = function () {

        $rootScope.top_bar = {
            page_title:'Students',
            main_menu_items:[
                { type:'item', label:'Logout', icon:'icon-lock', func:$rootScope.logout },
                { type:'item', label:'Help', icon:'icon-question-sign', func:$rootScope.help },
                { type:'item', label:'Info', icon:'icon-info-sign', func:$rootScope.info }
            ]
        };

        if($scope.selected_al_id != null && $rootScope.isMobile) {
            $rootScope.top_bar.page_title = "Activity Log";
            $rootScope.top_bar.back_button = {
                icon: 'icon-chevron-left',
                func: function(){ $scope.go(); }
            }
            return;
        }

//        var baseTitle = "Activity Logs - ";
//        $rootScope.top_bar.title_menu = [];
//
//        for (var i = 0; i < $rootScope.modes.modes.length; i++) {
//            var mode = $rootScope.modes.modes[i];
//            var manuLabel = baseTitle + angular.uppercase(mode);
//
//            if(mode == $rootScope.mode) {
//                $rootScope.top_bar.page_title = manuLabel;
//            } else {
//                var modeSelector = function(elem){
//                    $rootScope.mode = elem.func.mode;
//                    $scope.setupTopBar();
//                };
//                modeSelector.mode = mode;
//                $rootScope.top_bar.title_menu.push({
//                    label: manuLabel,
//                    func: modeSelector
//                });
//            }
//        }
    };

    $scope.setupTopBar();

    $scope.data = [];
    $scope.selected_u_id = $routeParams.id;
    $scope.selected_u = null;
    $scope.als = [];
    $scope.alsFilter = "'user_id'=4";

    $scope.files = [];
    $scope.addFile = function() {
        $scope.files.push({});
    }
    $scope.removeFile = function(index) {
        if (index < $scope.files.length) {
            $scope.files.splice(index, 1);
        }
    }

    auth.user(
        function (user) {
            if(angular.isUndefined(user) || user == null) {
                $rootScope.redirectAfterLogin = $location.url();
                $location.url('/client/login');
                return;
            }

            users.all(
                true,
                function(d, h) {    // SUCCESS
                    $scope.data = database.select('users', [], 3);
                }
            );

            als.all(
                true,
                null,
                function(d, h) {    // SUCCESS
                    $scope.als = database.select('als', [], 3);
                    console.log($scope.als);
                    if(angular.isDefined($scope.selected_u_id)) {

                    }
                }
            );

        }
    );

    $scope.go = function (id) {
        var url = '/client/supervisor';
        if (angular.isDefined(id)) {
            url += '/' + id;
        }
        $location.url(url);
    };

    $scope.reload = function () {
        als.all(
            true,
            $rootScope.mode,
            function (d, h) {    // SUCCESS
                $scope.data = database.select('als',[ {field:'modes',value:$rootScope.mode} ],3);
            }
        );
    };

    $scope.selected = function (id) {
        return $scope.selected_al_id == id ? 'active' : '';
    };

    $scope.download = function (id) {
        window.location.href = '/media/download/' + id + '?download=true';
    };

    $scope.startWatching = function (iframe_id) {
        var id = window.setInterval(function(){
            var iframe = document.getElementById(iframe_id);

            var content;
            // Message from server...
            if (iframe.contentDocument) {
                content = iframe.contentDocument.body.innerHTML;
            } else if (iframe.contentWindow) {
                content = iframe.contentWindow.document.body.innerHTML;
            } else if (iframe.document) {
                content = iframe.document.body.innerHTML;
            }

            if(content.length > 0) {
                window.clearInterval(id);

                if (iframe.contentDocument) {
                    iframe.contentDocument.body.innerHTML = "";
                } else if (iframe.contentWindow) {
                    iframe.contentWindow.document.body.innerHTML = "";
                } else if (iframe.document) {
                    iframe.document.body.innerHTML = "";
                }


                als.all(
                    true, // RELOAD
                    $rootScope.mode, // MODE
                    function (d, h) {                // SUCCESS
                        $scope.data = database.select('als',[ {field:'modes',value:$rootScope.mode} ],3);
                    }
                );

                if(iframe_id == 'iframec') {
                    als.get(
                        $scope.selected_al_id,
                        function (datum, h) {    // SUCCESS
                            $scope.selected_al = database.select('als', [ {field:'id',value:$scope.selected_al_id} ], 2)[0];
                            $scope.add_comment = false;
//                            document.getElementById('formc').reset();
                            $scope.resetFormC();
                        }
                    );
                } else {
                    $scope.go();
                }

            }

        }, 1000);
    };
    $scope.resetFormC = function () {
        document.getElementById('formc').reset();
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
        dialogFade:true,
        dialogClass:'image-shower modal'
    };
}