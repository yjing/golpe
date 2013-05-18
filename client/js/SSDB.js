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

Table.names = [];
function Table(name, pkey) {
    // ARGUMENT MANAGEMENT
    if(arguments.length == 0) {
        throw "Table: table name required";
    } else if(arguments.length == 1) {
        pkey = 'id';
    }
    var _THIS = this;

    if(Table.names.indexOf(name) >= 0) {
        throw "Table: name '" + name + "' already in use.";
    } else {
        Table.names.push(name);
    }

    var data = {};
    var name = name;
    var primary = pkey;

    this.getName = function(){
        return name;
    }
    this.getPrimary = function(){
        return primary;
    }
    this.getData = function(){
        return angular.copy(data);
    }


    this.insert = function(id, obj) {
        data[id] = obj;
    }
    this.get = function (id) {
        var ret = [];
        if(angular.isArray(id)) {
            for (var i = 0; i < id.length; i++) {
                ret.push(data[id[i]]);
            }
        } else {
            ret = data[id];
        }
        return ret;
    };
    this.select = function(fields){
        return new Query(this).select(fields);
    }

    this.select2 = function (where, fields) {
        if(angular.isUndefined(where) || where == null) {
            where = [];
        }
        if(angular.isUndefined(fields) || fields == null) {
            fields = false;
        }

        var res = [];
        angular.forEach(data, function(v, k){
            var put = true;
            for (var i = 0; i < where.length; i++) {
                var cond = where[i];
                console.log(v[cond.field] + " =? " + cond.value);
                if(!angular.equals(v[cond.field], cond.value)) {
                    put = false;
                }

            }
            if(put) {
                res.push(v);
            }
        });
        return res;
    };
    this.delete = function(id) {
        if(angular.isArray(id)) {
            for (var i = 0; i < id.length; i++) {
                delete data[id[i]];
            }
        } else {
            delete data[id];
        }
    }

}

function Query(table){
    if(angular.isUndefined(table) || table == null) {
        throw "Query: table required";
    }
    if(!(table instanceof Table)) {
        throw "Query: table type error";
    }

    var data = [];
    var fields;
    var conditions;

    this.select = function(flds) {
        if(angular.isUndefined(flds) || flds == null) {
            flds = [];
        }
        fields = flds;
        return this;
    }

    this.where = function(conds) {
        conditions = conds;
        return this;
    }

    this.execute = function() {
        return table.getData();
    }
}