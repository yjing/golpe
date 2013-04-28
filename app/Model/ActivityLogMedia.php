<?php

// app/Model/User.php
class ActivityLogMedia extends AppModel {
    public $useTable = "activity_logs_media";

    public $name = 'ActivityLogMedia';
    public $belongsTo = array('ActivityLog','Media');
    
}

?>
