<?php

// app/Model/User.php
class ActivityLogMedia extends AppModel {
    public $useTable = "activity_logs_media";

    public $name = 'ActivityLogMedia';
    
    public $belongsTo = array('ActivityLog','Media');
    

    public function beforeSave($options = array()) {
        parent::beforeSave($options);
        if(isset($this->data[$this->alias]['created'])) {
            unset($this->data[$this->alias]['created']);
        }
        if(isset($this->data[$this->alias]['modified'])) {
            unset($this->data[$this->alias]['modified']);
        }
        return $this->data;
    }
}

?>
