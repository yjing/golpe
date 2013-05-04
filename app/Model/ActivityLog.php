<?php

App::import('Model', 'Media');
App::import('Model', 'ActivityLogMedia');
App::import('Model', 'UserAwareModel');
App::import('Component', 'Session');
App::import('Behavior', 'HasMedia');

// app/Model/User.php
//class ActivityLog extends AppModel {
//class ActivityLog extends UserAwareModel {
class ActivityLog extends AssociativeModel {

    public $name = 'ActivityLog';
    public $useTable = "activity_logs";
//    public $actsAs = array('Containable', 'HasMedia', 
//        'HahManyThroughHABTM' => array(
//            'Media' => array(), 
//            'Comment' => array()
//        )
//    );
    
}

?>
