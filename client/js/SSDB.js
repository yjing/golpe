angular.module('SSDB', [])
    .service('SSDBService', function() {
        this.data = {};
        this.meta = {};

        this.createTable = function(table_name, pkey, options){
            // ARGUMENT MANAGEMENT
            if(arguments.length == 0) {
                throw "Create Table: table name required";
            } else if(arguments.length == 1) {
                pkey = 'id';
                options = {};
            } else if(arguments.length == 2) {
                if(angular.isString(arguments[1])) {
                    options = {};
                } else {
                    options = arguments[1];
                    pkey = 'id';
                }
            }

            var existing = this.meta[table_name];
            if(angular.isDefined(existing)) {
                throw "Create table: table name already in use.";
            }

            this.data[table_name] = {};
            this.meta[table_name] = { "pkey": pkey };

//            { field: 'test_id', on: { table: 'test', field: 'id' } }
            if(angular.isDefined(options.fkeys) && angular.isArray(options.fkeys)) {
                for (var i=0; i< options.fkeys.length; i++) {
                    this.addFKey(table_name, options.fkeys[i]);
                }
            }
        }

        this.addFKey = function(table_name, fkey){
            if(arguments.length < 2) {
                throw "Add FKey: table_name and fkey required.";
            }

            if(!angular.isString(table_name)) {
                throw "Add FKey: table_name and fkey required.";
            }

            if(fkey != null) {
                if(angular.isUndefined(fkey.field) || fkey.field == null) {
                    throw "Add FKey: fkey.field required.";
                }
                if(angular.isUndefined(fkey.on) || fkey.on == null) {
                    throw "Add FKey: fkey.on required.";
                } else {
                    if(angular.isUndefined(fkey.on.table) || fkey.on.table == null) {
                        throw "Add FKey: fkey.on.table required.";
                    }
                    if(angular.isUndefined(fkey.on.field) || fkey.on.field == null) {
                        throw "Add FKey: fkey.on.field required.";
                    }
                }
            } else {
                throw "Add FKey: fkey required.";
            }

            var table = this.meta[table_name];
            if(angular.isUndefined(table)) {
                throw "Add FKey: table '" + table_name + "' doesn't exists.";
            }
        }

    });