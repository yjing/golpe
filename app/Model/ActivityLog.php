<?php

App::import('Model', 'Media');
App::import('Model', 'ActivityLogMedia');
App::import('Model', 'UserAwareModel');
App::import('Component', 'Session');
App::import('Behavior', 'HasMedia');

// app/Model/User.php
//class ActivityLog extends AppModel {
class ActivityLog extends UserAwareModel {

    public $name = 'ActivityLog';
    public $useTable = "activity_logs";
    public $actsAs = array('Containable', 'HasMedia', 
        'HahManyThroughHABTM' => array(
            'Media' => array(), 
            'Comment' => array(),
            'Supervisor' => array(
                'target_model_name' => 'User',
                'join_table_name'=> 'supervisors',
                'target_fk' => 'supervisor_id',
                'model_fk' => 'student_id'
            )
        )
    );
    
}

?>
