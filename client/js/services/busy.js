app.service('busy', function(resources){
    var BUSY_CLASS_BUSY = "busy";
    var BUSY_CLASS_NOT_BUSY = "";

    this.busy_monitor = 0;
    this.busy_class = BUSY_CLASS_NOT_BUSY;

    this.busy = function (busy) {
        if (busy == true) {
            this.busy_monitor++;
            this.busy_class = this.busyClass();
        } else if (busy == false) {
            this.busy_monitor = Math.max(0, this.busy_monitor - 1);
            this.busy_class = this.busyClass();
        }
        return this.busy_monitor > 0;
    };

    this.busyClass = function () {
        if (this.busy_monitor > 0) {
            return BUSY_CLASS_BUSY;
        } else {
            return BUSY_CLASS_NOT_BUSY;
        }
    }
});
