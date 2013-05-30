angular.module('mscproject.comm', [])
    .service('comm', function($resource){
        this.test = function(){
            alert('Ciao');
        }
    });
