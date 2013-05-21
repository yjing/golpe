angular.module('SSDB', [])
    .service('database', function() {

        var getTable = function(table_name){
            var table = Table.tables[table_name];
            if(angular.isUndefined(table)) {
                throw "Table " + table_name + " doesn't exists.";
            }
            return table;
        }

        this.createTable = function(table_name, pkey, belongsTo, hasMany){
            return new Table(table_name, pkey, belongsTo, hasMany);
        }
        this.dropTable = function(table_name){
            var index = Table.names.indexOf(table_name);
            if(index >= 0) {
                Table.names.splice(index, 1);
                delete Table.tables[table_name];
                return true;
            } else {
                return false;
            }
        }
        this.table = function(table_name) {
            return getTable(table_name);
        }
        this.select = function(table_name, where, recursive){
            var table = getTable(table_name);
            return table.select(where, recursive);
        }
        this.insert = function(table_name, id, object){
            var table = getTable(table_name);
            return table.insert(id, object);
        }
        this.get = function(table_name, id, recursive) {
            var table = getTable(table_name);
            return table.get(id, recursive);
        }
        this.delete = function(table_name, id) {
            var table = getTable(table_name);
            return table.delete(id);
        }
    });

Table.names = [];
Table.tables = {};
function Table(name, pkey, blgTo, hsMany) {
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
        Table.tables[name] = this;
    }

    if(angular.isUndefined(blgTo) || blgTo == null) {
        blgTo = {};
    }

    if(angular.isUndefined(hsMany) || hsMany == null) {
        hsMany = {};
    }

    var data = {};
    var name = name;
    var primary = pkey;
    var belongsTo = blgTo;
    var hasMany = hsMany;
    var lastId = 0;
    Table.prototype.AUTOID = 'DB_TABLE_AUTO_ID';

    this.getName = function(){
        return name;
    }
    this.getPrimary = function(){
        return primary;
    }

    var toList = function(map) {
        var res = [];
        angular.forEach(map, function(v, k){
            res.push(angular.copy(v));
        },this);
        return res;
    }
    var addBelongsTo = function(res, recursive){
        angular.forEach(belongsTo, function(v,k){
            var table = Table.tables[ v.table ];
            var pk = table.getPrimary();
            var aName = k;
            var fkey = v.fkey;

            for (var i = 0; i < res.length; i++) {
                var cond = {
                    field: pk,
                    value: res[i][fkey]
                };
                var associated = table.select([cond], recursive - 1);
                if (associated.length > 0) {
                    res[i][aName] = associated[0];
                }
            }
        },this);
        return res;
    }
    var addHasMany = function(res, recursive){
        angular.forEach(hasMany, function(v,k){
            var table = Table.tables[ v.table ];
            var fkey = v.fkey;
            var pk = primary;
            var aName = k;

            for (var i = 0; i < res.length; i++) {
                var cond = {
                    field: fkey,
                    value: res[i][pk]
                }
                var associated = table.select([cond], recursive - 1);
                if(associated.length > 0) {
                    res[i][aName] = associated;
                }
            }
        },this);
        return res;
    }

    this.insert = function(id, obj) {
        if(id == Table.AUTOID) {
            id = lastId++;
        }
        data[id] = obj;
    }
    this.get = function (id, recursive) {
        var ret = [];
        // GET TABLE DATA
        if(angular.isArray(id)) {
            for (var i = 0; i < id.length; i++) {
                ret.push(data[id[i]]);
            }
        } else {
            ret = data[id];
        }

        // GET ASSOCIATIONS
        if(recursive > 0) {
            ret = addBelongsTo(ret, recursive);
            ret = addHasMany(ret, recursive);
        }
        return ret;
    };
    this.select = function (where, recursive) {
        if(angular.isUndefined(where) || where == null) {
            where = [];
        }
        if(angular.isUndefined(recursive) || !angular.isNumber(recursive)) {
            recursive = 0;
        }

        // SELECT TABLE DATA
        var res = [];
        angular.forEach(data, function(v, k){
            var put = true;
            for (var i = 0; i < where.length; i++) {
                var cond = where[i];
                if(!angular.equals(v[cond.field], cond.value)) {
                    put = false;
                }

            }
            if(put) {
                res.push(angular.copy(v));
            }
        });

        // SELECT ASSOCIATIONS
        if(recursive > 0) {
            res = addBelongsTo(res, recursive);
            res = addHasMany(res, recursive);
        }

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