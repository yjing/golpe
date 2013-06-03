function ProjectsCtrl($scopoe, $rootScope){
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

}
