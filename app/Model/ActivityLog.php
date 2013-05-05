<?php

App::import('Behavior', 'HasMedia');

// app/Model/User.php
//class ActivityLog extends AppModel {
//class ActivityLog extends UserAwareModel {
class ActivityLog extends AssociativeModel {

    public $name = 'ActivityLog';
    public $useTable = "activity_logs";
    public $belongsTo = array('User');
    public $actsAs = array('HasMedia', 'DataAuthorization');
    
}

?>
