<?php

App::import('Behavior', 'HasMedia');
class ActivityLog extends AssociativeModel {

    public $name = 'ActivityLog';
    public $useTable = "activity_logs";
    public $belongsTo = array('User');
    public $hasAndBelongsToMany = array('Comment', 'Media');
    public $actsAs = array('HasMedia', 'DataAuthorization');
    
}

?>
