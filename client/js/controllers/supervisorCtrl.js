function SupervisorCtrl($scope, $rootScope, $routeParams, $location, auth, als, users, database) {
    // TOP BAR
    $scope.setupTopBar = function () {

        $rootScope.top_bar = {
            page_title:'All Students Logs',
            buttons: [
                { icon:'icon-user', class: $rootScope.userButtonClass(), func:function(){ $rootScope.showSt = !$rootScope.showSt } }
            ],
            main_menu_items:[
                { type:'item', label:'Logout', icon:'icon-lock', func:$rootScope.logout },
                { type:'item', label:'Help', icon:'icon-question-sign', func:$rootScope.help },
                { type:'item', label:'Info', icon:'icon-info-sign', func:$rootScope.info }
            ]
        };


        if($scope.selected_a_id != null) {
            $rootScope.top_bar.page_title = "Activity Log";
            $rootScope.top_bar.back_button = {
                icon: 'icon-chevron-left',
                func: function(){ $scope.go($scope.selected_u_id); }
            }
            return;
        }

        if($scope.selected_u_id != null) {
            var user = database.select('users', [ {field:'id',value:$scope.selected_u_id} ], 0)[0];
            $rootScope.top_bar.page_title = user.username + " Logs";
            $rootScope.top_bar.back_button = {
                icon: 'icon-chevron-left',
                func: function(){ $scope.go(); }
            }
        }
    };
    $rootScope.userButtonClass = function(){
        return $rootScope.showSt ? 'users-button-active' : '';
    }
    $rootScope.$watch('showSt', function() {
        $scope.setupTopBar();
    })
    $scope.setupTopBar();

    $scope.data = [];
    $scope.selected_u_id = $routeParams.id;
    $scope.selected_u = null;

    $scope.als = [];
    $scope.selected_a = null;
    $scope.selected_a_id = $routeParams.alid;
    $scope.alsFilter = null;
    $scope.order = ['-toAnswer', '-modified'];

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
                    $scope.als = $scope.prepareAls(database.select('als', [], 3));
                    if(angular.isDefined($scope.selected_u_id)) {
                        $scope.alsFilter = {
                            user_id: $scope.selected_u_id
                        }
                        $rootScope.$watch('isMobile', function(){
                            $scope.setupTopBar();
                        });
                    }
                    if(angular.isDefined($scope.selected_a_id)) {
                        als.get(
                            $scope.selected_a_id,
                            function(d, h) {    // SUCCESS
                                $scope.selected_a = database.select('als', [ {field:'id', value:$scope.selected_a_id} ], 3);
                            }
                        );
                    }
                }
            );

        }
    );

    $scope.prepareAls = function (als) {
        if(angular.isDefined(als) && angular.isArray(als) && als.length > 0) {
            for (var i = 0; i < als.length; i++) {
                var toAnswer = false;
                if(als[i].question) {
                    if(angular.isDefined(als[i].comments) && angular.isArray(als[i].comments) && als[i].comments.length > 0) {
                        toAnswer = true;
                        for (var j = 0; j < als[i].comments.length; j++) {
                            if(als[i].comments[j].user_id == $rootScope.user.id) {
                                toAnswer = false;
                            } else {
                                toAnswer = true; // no break here because if new comments arrive after his answer
                                                 // the SUPERVISOR should notice them
                            }
                        }
                    }
                }
                als[i].toAnswer = toAnswer;
            }
            return als;
        }
    };

    $scope.go = function (id, al_id) {
        var url = '/client/supervisor';
        if (angular.isDefined(id)) {
            url += '/' + id;
        }
        if (angular.isDefined(al_id)) {
            url += '/' + al_id;
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

    $scope.selectedU = function (id) {
        return $scope.selected_u_id == id ? 'active' : '';
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