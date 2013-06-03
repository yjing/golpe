function ProjectsCtrl($scope, $rootScope, $routeParams, $location, database, projects){
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


    $scope.selected_project_id = null;

    projects.all(
        function(d, h) {    // SUCCESS
            $scope.data = database.select('projects',[], 3);
            console.log($scope.elements);
        }
    );

    $scope.go = function(id){
        var url = '/client/projects';
        if (angular.isDefined(id)) {
            url += '/' + id;
        }
        $location.url(url);
    };

}
