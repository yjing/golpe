angular.module('SSDB', [])
    .service('SSDBService', function() {
        this.data = {};
        this.meta = {};

        this.createTable = function(table_name){
            var existing = this.meta[table_name];
            if(angular.isDefined(existing)) {
                throw "Table name already in use.";
                console.log("PASSED HERE");
            }

            this.data[table_name] = {};
            this.meta[table_name] = {};
        }

    });