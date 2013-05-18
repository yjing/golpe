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
            this.meta[table_name] = {
                primary: pkey,
                fkeys: {},
                referred: {}
            };

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
                } else if(!angular.isString(fkey.field)) {
                    throw "Add FKey: fkey.field has to be a string.";
                } else if(fkey.field.trim().length == 0) {
                    throw "Add FKey: fkey.field is empty.";
                }

                if(angular.isUndefined(fkey.refers) || fkey.refers == null) {
                    throw "Add FKey: fkey.refers required.";
                } else if(!angular.isString(fkey.refers)) {
                    throw "Add FKey: fkey.refers has to be a string.";
                } else if(fkey.refers.trim().length == 0) {
                    throw "Add FKey: fkey.refers is empty.";
                }

            } else {
                throw "Add FKey: fkey required.";
            }

            if(angular.isUndefined(this.meta[table_name])) {
                throw "Add FKey: table '" + table_name + "' doesn't exists.";
            }
            if(angular.isUndefined(this.meta[fkey.refers])) {
                throw "Add FKey: referenced table '" + fkey.refers + "' doesn't exists.";
            }

            this.meta[table_name].fkeys[fkey.field] = fkey.refers;
            this.meta[fkey.refers].referred[table_name] = fkey.field;

        }

    });

function Table(name, pkey) {
    this.name;
    this.primary;

    // ARGUMENT MANAGEMENT
    if(arguments.length == 0) {
        throw "Table: table name required";
    } else if(arguments.length == 1) {
        pkey = 'id';
    }

    this.name = name;
    this.primary = pkey;
    Table.names.push(name);

    this.getName = function(){
        return this.name;
    }

    this.getPrimary = function(){
        return this.primary;
    }

}