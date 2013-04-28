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
    public $actsAs = array('Containable', 'HasMedia', 'HahManyThroughHABTM' => array('Media', 'Comment'));
 
    public function beforeSave($options = array()) {
        
        if(isset($this->data[$this->alias]['created'])) {
            unset($this->data[$this->alias]['created']);
        }
        if(isset($this->data[$this->alias]['modified'])) {
            unset($this->data[$this->alias]['modified']);
        }
        
        parent::beforeSave($options);
    }
    
}

?>
