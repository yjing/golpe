<?php

App::import('Model', 'Media');
App::import('Model', 'ActivityLogMedia');
App::import('Model', 'UserAwareModel');
App::import('Component', 'Session');

// app/Model/User.php
class ActivityLog extends UserAwareModel {

    public $name = 'ActivityLog';
    public $useTable = "activity_logs";
    public $actsAs = array('Containable', 'HasMedia');

    public $belongsTo = "User";
    public $hasAndBelongsToMany = array(
        "Media" => array(
            'order' => 'Media.modified DESC'
        ) 
        ,"Comment" => array(
            'order' => 'Comment.modified DESC'
        )
    );
    
    public function beforeSave($options = array()) {
        parent::beforeSave($options);
        
        if($this->data[$this->alias]) {
            
            $this->Session = new SessionComponent(new ComponentCollection());
            $user = $this->Session->read("Auth.User");

            $this->data[$this->alias]['user_id'] = $user['id'];
            $this->data[$this->alias]['draft'] = false;
            
            return true;
            
        } else {
            
            return false;
            
        }
    }
    
}

?>
