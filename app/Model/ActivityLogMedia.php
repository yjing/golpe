<?php

// app/Model/User.php
class ActivityLogMedia extends AppModel {
    public $useTable = "activity_logs_media";

    public $name = 'ActivityLogMedia';
    
    public $belongsTo = array('ActivityLog','Media');
    

    public function beforeSave($options = array()) {
        parent::beforeSave($options);
        debug($this->data);
        die();
    }
}

?>
