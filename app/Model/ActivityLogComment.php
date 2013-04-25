<?php

class ActivityLogComment extends AppModel {
    public $useTable = "activity_logs_comments";
    public $name = 'ActivityLogComment';
    public $belongsTo = array('ActivityLog','Comment');
}

?>
