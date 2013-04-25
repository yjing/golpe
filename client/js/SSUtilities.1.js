angular.module('SSUtilities', [])
    .service('DialogService', function($compile) {
        this.dialogs = {};

        this.createDialog = function(id, scope, template, options) {
            if (id!=null && this.dialogs[id] == null) {
                this.dialogs[id] = {
                    "id": id,
                    "elem": $("<div id='" + id + "'><div ng-include src='DIALOG_Template_url'></div></div>").dialog(options)
                }
                var scope_ = scope.$new();
                scope_.DIALOG_Template_url = template;
                $compile(this.dialogs[id].elem)(scope_);
            }
        }
        this.destroyDialog = function(id, options) {
            if (id!= null && this.dialogs[id] != null) {
                this.dialogs[id].elem.remove();
                this.dialogs[id] = undefined;
            }
        }

        this.openDialog = function(id) {
            if (id!= null && this.dialogs[id] != null) {
                this.dialogs[id].elem.dialog("open");
            }
        }

        this.closeDialog = function(id) {
            if (this.dialogs[id] != null) {
                this.dialogs[id].elem.dialog("close");
            }
        }
    }
    ).service('WindDims', function(){
        this.jqWin = $(window);
        this.dims = { w:this.jqWin.width(), h:this.jqWin.height() };
        this.listeners = [];

        var THIS = this;
        this.jqWin.resize(function() {
            THIS.calcDims();
            for (var i=0; i<THIS.listeners.length; i++) {
                THIS.listeners[i]();
            }
        });

        this.calcDims = function(){
            this.dims = { w:this.jqWin.width(), h:this.jqWin.height() };
        };

        this.getWinDims = function(){
            return this.dims;
        };

        this.registerCallback = function(func) {
            if (func != null) {
                this.listeners.push(func);
            }
        };

    });
